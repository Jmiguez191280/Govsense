function getMasterPin() {

    try {
        var arr = []
        var usageThreshold = 40;
        var startRow = 0;
        var endRow = 1000;
        var resultCount = 0;
        var allResults = [];
        var columns = [];
        columns.push(new nlobjSearchColumn('internalid'));
        columns.push(new nlobjSearchColumn('custrecord_gs_coo_master_pin'));
        // var col = new nlobjSearchColumn('name');
        // var records = nlapiSearchRecord("customrecord_ngf", null, ["inactive", "is", "F"], new nlobjSearchColumn('name'));
        var allSearch = nlapiCreateSearch("customrecord_gs_pkng_parkingcitation", [
            ["custrecord_gs_coo_master_pin", "isnot", "4C432"],
            "AND",
            ["isinactive", "is", "F"]
        ], columns);
        var resultSet = allSearch.runSearch();

        do {
            var results = resultSet.getResults(startRow, endRow);
            var remainingUsagePoints = nlapiGetContext().getRemainingUsage();
            if ((remainingUsagePoints > usageThreshold) && results) {
                resultCount = results.length;
                allResults = allResults.concat(results);
                startRow = endRow;
                endRow = endRow + 1000;
            }
        } while (resultCount > 999);
        if (allResults) {

            nlapiLogExecution("DEBUG", 'allResults', allResults.length);

            for (var i = 0; i < allResults.length; i++) {

                var columnsSearch = allResults[i].getAllColumns();
                if (nlapiGetContext().getRemainingUsage() <= 200) {
                    setRecoveryPoint();
                    checkGovernance();
                }
                var recorId = allResults[i].getValue(columnsSearch[0])
                var updatefields = nlapiSubmitField('customrecord_gs_pkng_parkingcitation', recorId, 'custrecord_gs_coo_master_pin', '4C432');
                nlapiLogExecution("DEBUG", 'recorId', recorId);
                nlapiLogExecution("DEBUG", 'updatefield in record', updatefields);
            }
        }else{
          return;
        }
    } catch (e) {
        nlapiLogExecution("DEBUG", 'assignItems', e);

    }

}



function setRecoveryPoint() {
    var state = nlapiSetRecoveryPoint(); //100 point governance
    if (state.status == 'SUCCESS') return; //we successfully create a new recovery point
    if (state.status == 'RESUME') //a recovery point was previously set, we are resuming due to some unforeseen error
    {
        nlapiLogExecution("ERROR", "Resuming script because of " + state.reason + ".  Size = " + state.size);
        handleScriptRecovery();
    } else if (state.status == 'FAILURE') //we failed to create a new recovery point
    {
        nlapiLogExecution("ERROR", "Failed to create recovery point. Reason = " + state.reason + " / Size = " + state.size);
        handleRecoveryFailure(state);
    }
}

function checkGovernance() {
    var context = nlapiGetContext();
    var state = nlapiYieldScript();

    if (state.status == 'FAILURE') {
        nlapiLogExecution("ERROR", "Failed to yield script, exiting: Reason = " + state.reason + " / Size = " + state.size);
        throw "Failed to yield script";
    } else if (state.status == 'RESUME') {
        nlapiLogExecution("AUDIT", "Resuming script because of " + state.reason + ".  Size = " + state.size);
    }
    // state.status will never be SUCCESS because a success would imply a yield has occurred.  The equivalent response would be yield
}