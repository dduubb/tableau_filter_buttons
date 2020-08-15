import { buttonActions } from './buttonActions.js'
export const displayHTML = (result) => {
    let filterContainerElement = document.getElementById("filterTableBody");
    let innerHtml = "";
    result.forEach(filter => {
        if (filter.$type === "categorical" && filter.$caption.split(" ")[0] !== "Action") {
            let allHtml = ""
            let appliedValues = "";
            filter.$appliedValues.forEach(value => {
                appliedValues += `
                <div class="btn-group btn-group">
                <button action="setOne" params='${filter.$caption},${value.value}' type="button" class="btn btn-primary btn-xs">${value.formattedValue}</button>
                <button class="btn btn-primary btn-xs " static="true" action='removeOne' params='${filter.$caption},${value.value}'>&times;</button>
                </div>`;
            });
            innerHtml += `<tr>
                            <th> ${filter.$caption} </th>
                            <td> ${allHtml}
                            <div hidden="hidden" class="btn-group btn-group"><button action="setAll" static="true" params="${filter.$caption}" class="btn btn-secondary btn-xs">All</button></div>
                                ${appliedValues}
                                <td>
                            </tr>`;
        }
    });
    filterContainerElement.innerHTML = innerHtml;
    //document.querySelectorAll('#filterTableBody td div').forEach(e=>e.addEventListener("mouseover", e=> console.log(e)))

    document.querySelectorAll('#filterTableBody td div').forEach(e => e.addEventListener("click", e => {
        //e.target.classList.toggle("active");
        //e.target.parentNode.parentNode.querySelectorAll("button").forEach((button) => {button.classList.toggle("active")});

        let params = e.target.getAttribute("params")
        let action = e.target.getAttribute("action")
        buttonActions[action](params)
        buttonAppearance(e,action)
    }))

    document.getElementById("clear-filter").addEventListener("click", e => buttonActions.clearFilters())

    let buttonAppearance = (e, action) => {
        if (action === "setAll") { 
            // e.target.parentNode.setAttribute("hidden","hidden")
            // e.target.parentNode.parentNode.querySelectorAll("button").forEach((button) => {
            //     button.removeAttribute("hidden")});
        } else  if (action === "removeOne") {
            // e.target.parentNode.setAttribute("disabled","disabled")
            // e.target.removeAttribute("active")
            // e.target.setAttribute("hidden","hidden")
            // e.target.parentNode.parentNode.querySelectorAll("div")[0].removeAttribute("hidden")
        } else if(action === "setOne") {            
            // e.target.parentNode.parentNode.querySelectorAll("div")[0].removeAttribute("hidden")
        }
    }

};

export function updateHTML(result) {
document.querySelectorAll('#filterTableBody td div button').forEach(a => {
    a.classList.add("disabled")
    if (a.getAttribute("static") !== "true" && a.parentNode.parentNode.children[0].getAttribute("hidden")!=="hidden"){
    a.setAttribute("action","addOne")} else if (a.parentNode.parentNode.children[0].getAttribute("hidden")==="hidden" && a.getAttribute("static") !== "true") {
        a.setAttribute("action","setOne")
    }
})
    let filterContainerElement = document.getElementById("filterTableBody");
    let innerHtml = "";
    
    console.log("HERE  ",result)
    result.forEach(filter => {
        if (filter.$type === "categorical" && filter.$caption.split(" ")[0] !== "Action") {
            console.log("filter is selected  ",filter.$isAllSelected)
            //if (!filter.$isAllSelected) {document.querySelector(`[params='${filter.$caption}']`).parentNode.removeAttribute("hidden") }
            filter.$isAllSelected ? document.querySelector(`[params='${filter.$caption}']`).parentNode.setAttribute("hidden","hidden") : document.querySelector(`[params='${filter.$caption}']`).parentNode.removeAttribute("hidden")
            filter.$appliedValues.forEach(value => {
                document.querySelectorAll(`[params='${filter.$caption},${value.value}']`).forEach(el=>el.classList.remove("disabled"))
        })
    };
    
})};

export function disableHTML(trigger) {
    if (trigger) {
        document.getElementById("filterTableBody").parentElement.parentElement.setAttribute("hidden","hidden")
        console.log(trigger)  
    } else {
        document.getElementById("filterTableBody").parentElement.parentElement.removeAttribute("hidden")
      console.log(trigger)  
    }
    
}