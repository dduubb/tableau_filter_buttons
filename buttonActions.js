import { viz } from "./index.js"

export let buttonActions = {
    setOne(params) {
        let param = params.split(",")
        viz.myTargetSheet.forEach(worksheet => worksheet.applyFilterAsync(param[0], param[1], tableau.FilterUpdateType.REPLACE))
    },
    addOne(params) {
        let param = params.split(",")
        viz.myTargetSheet.forEach(worksheet => worksheet.applyFilterAsync(param[0], param[1], tableau.FilterUpdateType.ADD))
    },
    setAll(param) {
        viz.myTargetSheet.forEach(worksheet => worksheet.applyFilterAsync(param, "", tableau.FilterUpdateType.ALL))
    },
    removeOne(params) {
        let param = params.split(",")
        viz.myTargetSheet.forEach(worksheet => worksheet.applyFilterAsync(param[0], param[1], tableau.FilterUpdateType.REMOVE))

    },
    clearFilters() {
        viz.myTargetSheet.forEach(worksheet => worksheet.getFiltersAsync().then(filters => {
            filters.forEach(filter => worksheet.clearFilterAsync(filter.$caption))
        }))
    }
}
