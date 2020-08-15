import  {displayHTML , updateHTML, disableHTML} from './layout.js'

document.addEventListener("DOMContentLoaded", () => {
    initViz("vizContainer","https://public.tableau.com/views/COVID-19CaseVisualizerJohnsHopkinsData/Overview",["States","Regions"]);
});

//https://public.tableau.com/views/QuickUSCovid-19Visualization/Overview
//https://public.tableau.com/views/PlayAroundFilters/Sheet1
//https://public.tableau.com/views/PlayAroundFilters/Dashboard2
//https://public.tableau.com/views/COVID-19CaseVisualizerJohnsHopkinsData/Overview
//https://public.tableau.com/views/PlayAroundFilters2/Sheet2
export let viz;

const excludeFilterItems = ["Party2","MDY(Date)","Date"]

function initViz(divID,url) {
    let options = {}
    let containerDiv = document.getElementById(divID)
    options.hideTabs = false,
    options = {        
        onFirstInteractive: () => {
            setWorkbook();
            let worksheets = viz.myTargetSheet   
            viz.addEventListener("filterchange", e => {
                try {
                    processFilters(worksheets).then(filters => updateHTML(filters))
                } catch (error) {
                    console.error(error);
                }                
            })
            viz.addEventListener("tabswitch", e => {
                console.log("switched change")
            console.log(viz.getWorkbook().$workbookImpl.$activeSheetImpl.$name)
            viz.getWorkbook().activateSheetAsync(viz.getWorkbook().$workbookImpl.$activeSheetImpl.$name).then(e=>setWorkbook())
            })
            processFilters(worksheets).then(filters => displayHTML(filters)).catch(err=>console.error(err))
        }
    };
    viz = new tableau.Viz(containerDiv, url, options);    
    window.viz = viz
}

let getFilters = worksheets => {
    let allfiltersPromises = []

    worksheets.forEach(worksheet => {
        let filterPromise = worksheet.getFiltersAsync()
        allfiltersPromises.push(filterPromise)
    })
    return Promise.all(allfiltersPromises)
}

let removeDuplicates = (filters) => {
    let excludeFilter = (element,a) => {
        console.log(element);
        return a.indexOf(element) === -1 }
    let uniquefilters = filters.filter((filter, pos) => {
        return filters.findIndex ((item) => item.$caption === filter.$caption) === pos
    }).filter((filter,pos) => filter.$isExclude !== true).filter(f=>excludeFilter(f.$caption,excludeFilterItems))
   // console.log([...uniquefilters]);
    return [...uniquefilters];
}

let processFilters = async (worksheets) => {
    let allFilters = await getFilters(worksheets)
    return removeDuplicates(allFilters.reduce((acc, val) => acc.concat(val), []))
}

function setWorkbook() {
    if (viz.getWorkbook().getActiveSheet()._impl.$sheetType === "dashboard") {
        disableHTML(false)
        viz.myTargetSheet = viz.getWorkbook().getActiveSheet().getWorksheets();
    }
    else if (viz.getWorkbook().getActiveSheet()._impl.$sheetType === "story"){
        disableHTML(true)
    } else
    {
        disableHTML(false)
        viz.myTargetSheet = [];
        viz.myTargetSheet.push(viz.getWorkbook().getActiveSheet());
    }
}

