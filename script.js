(function(document) {
    //'use strict';

document.addEventListener("DOMContentLoaded", function () {
    initViz();
});

var viz,  vizes;
vizes = [
    {
        url: "https://public.tableau.com/views/QuickUSCovid-19Visualization/Overview",
        targetSheet: "States"
        }, {
        url: "https://10ax.online.tableau.com/t/wunderlichdev599652/views/ExtensionsTut/Dashboard/dalew@ksu.edu/e7af6a33-9024-4cda-88d5-db9da31bed95?:display_count=n&:showVizHome=n&:origin=viz_share_link",
        targetSheet: "Overview Map"
        }
    ];

/** init a sample dashboard from my tableau dev site */
function initViz() {
    var options;
    var containerDiv = document.getElementById("vizContainer"),
        // define url to a Overview view from the Superstore workbook on my tableau dev site
        //url = "https://public.tableau.com/views/QuickUSCovid-19Visualization/Overview";
        url = vizes[0].url;
    options = {
        hideTabs: false,
        onFirstInteractive: function () {
            var worksheets = getWorksheets(viz).targetBook;
            // process all filters used on the dashboard initially and subscribe to any filtering event comming out of the dashboard to recompute the filters on the webpage.
            viz.addEventListener("filterchange", function (e) { //e => {
                worksheets = getWorksheets(e.getViz()).targetBook;
                //processFilters(worksheets);
            });
            viz.addEventListener(tableau.TableauEventName.MARKS_SELECTION, function(marksEvent){ //marksEvent => {
                worksheets = getWorksheets(marksEvent.getViz()).targetBook;
                //processFilters(worksheets);
                //processFilterStatus(worksheets);//
                alert("mark is selected");
            });
            displayHTML(viz);
            //processFilters(worksheets);
        }
    };
    viz = new tableau.Viz(containerDiv, url, options);
}

/** extract all filters from the viz object */
function getWorksheets(viz) {
    return {
        targetBook: viz.getWorkbook().getActiveSheet().getWorksheets(),
        targetSheet: viz.getWorkbook().getActiveSheet().getWorksheets().get(vizes[0].targetSheet)
    };
}

function processFilters(worksheets) {

    /** remove any duplicates from the flattened array of filters since a same filter can be used in at the same time.  */
    var removeDuplicates = function (filters) {
        var uniquefilters = filters.filter((filter, pos) => {
            return filters.findIndex ((item) => item.$caption === filter.$caption) === pos;
        });
        return [...uniquefilters];
    };

    /** get all the filters using tableau.getFiltersAsync() */
    var getFilters = worksheets => {
        var allfiltersPromises = [];
        worksheets.forEach(worksheet => {
            var filterPromise = worksheet.getFiltersAsync();
            allfiltersPromises.push(filterPromise);
        });
        return Promise.all(allfiltersPromises);
    };



    var filtersm = getFilters(worksheets).then(allFilters => {
        let filter = [];
        filters = allFilters.reduce((acc, val) => acc.concat(val), []); //filters = allFilters.flat();
        filters = removeDuplicates(filters);
        filtersm = filters;
    });
    return {
        filters: filtersm
    }
}


var buttonActions = function (action,params) {
    var filterFunctions = {
        removeOne: (from,a) => {
            worksheet = getWorksheets(viz).targetSheet;
            console.log(`Applying this filter: ${from}`);
            return worksheet.applyFilterAsync(from, a, tableau.FilterUpdateType.REMOVE);
        },
        setOne: (from,a) => {
            worksheet = getWorksheets(viz).targetSheet;
            console.log(`Applying this filter: ${from} `);
            return worksheet.applyFilterAsync(from, a, tableau.FilterUpdateType.REPLACE);
        },
        addOne: (from,a) => {
            worksheet = getWorksheets(viz).targetSheet;
            console.log(`Applying this filter: ${from} `);
            return worksheet.applyFilterAsync(from, a, tableau.FilterUpdateType.ADD);
        },
        clearFilters: () => {
            if (viz) {
                var worksheets = getMyWorksheets(viz);
                worksheets.forEach(worksheet => {
                    worksheet.getFiltersAsync().then(filters => {
                        filters.forEach(filter => {
                            worksheet.clearFilterAsync(filter.$caption);
                        });
                    }); //getFilters(worksheets)
                });

            }
        },
        setAll: (from) => {
            worksheet = getWorksheets(viz).targetSheet;
            console.log(`Applying this filter: ${from}`);
            return worksheet.applyFilterAsync(from, "", tableau.FilterUpdateType.ALL);
        }
    };
    params = params.split(",");
    switch (action) {
        case 'set-one':
            filterFunctions.setOne(params[0],params[1]);
            break;
        case 'set-all':
            filterFunctions.setAll(params[0]);
            break;
        case 'remove-one':
            console.log(action)
            filterFunctions.removeOne(params[0],params[1]);
            break;
        case 'clear-filters':
            filterFunctions.clearFilters();
            break;
        default:
            console.log('action does not exist');
            break;
    }
}


/** display filters by name and applied values in the ui of the webpage by generating html for each filter */
function displayHTML(viz) {
    processFilters(getWorksheets(viz).targetBook).filters.then(function (result) {
        var filterContainerElement = document.getElementById("filterTableBody");
        var innerHtml = "";
        filters.forEach(filter => {
            if (filter.$type === "categorical" && filter.$caption.split(" ")[0] !== "Action") {
                var numberSelected = filter.$appliedValues.length;
                //alert (numberSelected);
                var allClass = (filter.$isAllSelected ?  "active" : "notactive");                    
                var allHtml = `<span action="set-all" params="${filter.$caption}" class="btn btn-secondary btn-xs ${allClass}">All </span>`
                var appliedValues = "";
                filter.$appliedValues.forEach(value => {appliedValues += `<div class="btn-group btn-group">
                <button action="set-one" params='${filter.$caption},${value.value}' type="button" class="btn btn-primary btn-xs">
                ${value.formattedValue}
                </button><button class="btn btn-primary btn-xs " action='remove-one' params='${filter.$caption},${value.value}'>&times;</button>
                </div> \n`;
                });
                innerHtml += `<tr>
                            <th> ${filter.$caption} </th>
                            <td> ${allHtml}
                            <span action="set-all" params="${filter.$caption}" class="btn btn-secondary btn-xs"> All </span>
                                ${appliedValues} <td>
                            </tr> \n`;}
        });
        filterContainerElement.innerHTML = innerHtml;
        filterContainerElement.addEventListener('click', (function (e) {
            e.target.classList.toggle("active");

            e.target.parentNode.parentNode.querySelectorAll("button").forEach((button) => {button.classList.toggle("active")});

            var functionName = `${e.target.attributes.action.value}`;
            var functionParams = `${e.target.attributes.params.value}`;
            //console.log(functionName , functionParams);
            buttonActions(functionName, functionParams);
                  //console.log(functionName , functionParams);
        }))
    })
};

})(document);
