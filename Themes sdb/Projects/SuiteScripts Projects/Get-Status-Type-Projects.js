/**
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 */

define(['N/record', 'N/search'], function (record, search) {

    function getProjectTypes() {
        var arrRet = [];
        try {

            var srch = search.create({
                type: "customrecord_gs_coo_projecttype",
                filters: [
                    ["isinactive", "is", "F"]
                ],
                columns: [search.createColumn({
                    name: "name",
                    sort: search.Sort.ASC,
                    label: "Name"
                })]
            });
           
            var searchResultCount = srch.runPaged().count;
            log.debug('getCaseTypes', 'result count : ' + searchResultCount);

            srch.run().each(function (result) {

                arrRet.push({
                    id: result.id,
                    name: result.getValue('name')
                });
                return true;
            });
        } catch (e) {
            log.error('getCaseTypes', 'ERROR : ' + e);
        }
        // log.debug('getCaseTypes', 'arrRet : ' + JSON.stringify(arrRet));

        return arrRet;
    }

    function returnStatusCase() {
        var obj = record.load({
            type: 'customrecord_online_support_case_config',
            id: 1
        });
        var caseStatuses = obj.getValue('custrecord_oscc_case_status_list');
        var arrCaseStatusNames = String(obj.getText('custrecord_oscc_case_status_list')).split(',');

        log.audit('getFunction', 'Case status list : ' + caseStatuses);
        log.audit('getFunction', 'Case status list (name) : ' +
            arrCaseStatusNames);

        var arrStatusList = [];
        for (x in caseStatuses) {

            // log.audit('x : ' + x);
            //   log.audit('caseStatuses[x] : ' + ' id : ' + caseStatuses[x] + 'name : ' + arrCaseStatusNames[x]);

            arrStatusList.push({
                id: caseStatuses[x],
                name: arrCaseStatusNames[x]
            });

        }
        // log.audit('returnStatusCase', 'arrStatusList : ' + JSON.stringify(arrStatusList));
        return arrStatusList;
    }

    function returnStatus() {
        var status = [
            {
                "value": "",
                "text": ""
            },
            {
                "value": "5",
                "text": " -NONE-"
            },
            {
                "value": "1",
                "text": "30% Review"
            },
            {
                "value": "2",
                "text": "60% Review"
            },
            {
                "value": "3",
                "text": "90% Review"
            },
            {
                "value": "4",
                "text": "Adopted"
            },
            {
                "value": "18",
                "text": "ADOPTED W CONDI"
            },
            {
                "value": "19",
                "text": "APP W/CONDITION"
            },
            {
                "value": "20",
                "text": "APPROVED"
            },
            {
                "value": "21",
                "text": "APPROVED FOR PR"
            },
            {
                "value": "22",
                "text": "APPVD FOR PRESITE"
            },
            {
                "value": "23",
                "text": "APPVDFORPRESITE"
            },
            {
                "value": "24",
                "text": "ASSESMENT"
            },
            {
                "value": "25",
                "text": "AWARDED"
            },
            {
                "value": "26",
                "text": "CANCELLED"
            },
            {
                "value": "27",
                "text": "CLOSED"
            },
            {
                "value": "28",
                "text": "COMPLETE"
            },
            {
                "value": "29",
                "text": "COMPLETED"
            },
            {
                "value": "30",
                "text": "CONCEPTUAL APPR"
            },
            {
                "value": "31",
                "text": "CONCEPTUAL APPROVAL"
            },
            {
                "value": "73",
                "text": "CONDAPPROVAL"
            },
            {
                "value": "32",
                "text": "CONDITIONAL APP"
            },
            {
                "value": "33",
                "text": "CONDITIONAL APPROVAL"
            },
            {
                "value": "34",
                "text": "CONSTRUCTION"
            },
            {
                "value": "35",
                "text": "CORR NEEDED"
            },
            {
                "value": "36",
                "text": "DENIED"
            },
            {
                "value": "37",
                "text": "EXPIRED"
            },
            {
                "value": "38",
                "text": "FEES PAID - ONLINE"
            },
            {
                "value": "39",
                "text": "FINAL"
            },
            {
                "value": "40",
                "text": "FINAL REVIEW"
            },
            {
                "value": "41",
                "text": "FINALED"
            },
            {
                "value": "42",
                "text": "HOLD"
            },
            {
                "value": "43",
                "text": "IMP PLAN APPROV"
            },
            {
                "value": "44",
                "text": "IMP PLAN APPROVED"
            },
            {
                "value": "45",
                "text": "INELIGIBLE"
            },
            {
                "value": "46",
                "text": "LIEN"
            },
            {
                "value": "47",
                "text": "MORTG RECORDED"
            },
            {
                "value": "48",
                "text": "MORTGAGE"
            },
            {
                "value": "49",
                "text": "NOTICE TO PROCEED"
            },
            {
                "value": "50",
                "text": "ON APPLICATION"
            },
            {
                "value": "51",
                "text": "ON HOLD"
            },
            {
                "value": "52",
                "text": "OPEN"
            },
            {
                "value": "53",
                "text": "PENDING DOCUMENTS"
            },
            {
                "value": "54",
                "text": "PENDING WALKTHROUGH"
            },
            {
                "value": "55",
                "text": "PLAT APPROVAL"
            },
            {
                "value": "56",
                "text": "PLATTED"
            },
            {
                "value": "57",
                "text": "POST TO BID"
            },
            {
                "value": "58",
                "text": "PRE CONCEPTUAL"
            },
            {
                "value": "59",
                "text": "PRE CONSTRUCTION"
            },
            {
                "value": "60",
                "text": "PRELIMINARY"
            },
            {
                "value": "61",
                "text": "PROJECT COMPLETE"
            },
            {
                "value": "62",
                "text": "RECORDED"
            },
            {
                "value": "63",
                "text": "RESEARCH"
            },
            {
                "value": "64",
                "text": "REVISED"
            },
            {
                "value": "74",
                "text": "STAFF REVIEW"
            },
            {
                "value": "65",
                "text": "SUBMITTED"
            },
            {
                "value": "66",
                "text": "TABLED"
            },
            {
                "value": "67",
                "text": "TERMINATED"
            },
            {
                "value": "68",
                "text": "UNDER CONTRACT"
            },
            {
                "value": "69",
                "text": "UNDER REVIEW"
            },
            {
                "value": "70",
                "text": "UNDER REVIEW EPLANS"
            },
            {
                "value": "71",
                "text": "VOID"
            },
            {
                "value": "72",
                "text": "WITHDRAWN"
            }
        ]
        return status;
    }
    function getListValues() {
        var searchColumn = search.createColumn({
            name: 'name'
        });
        var listSearch = search.create({
            type: 'customlist_gs_coo_hearingtype',
            columns: searchColumn
        });
        var listArray = [];
        listSearch.run().each(function (searchResult) {
            listArray.push({
                value:searchResult.id,
                text:searchResult.getValue(searchColumn)});
            return true;
        });
        log.debug('listArray', listArray);
        return listArray;
    }

    function onRequestFxn(context) {

        try {
            var objData = {}
            var statusList = returnStatus();//returnStatusCase();
            var projectTypes = getProjectTypes();
            var hearingtypes = getListValues();

            if (projectTypes) objData.projectTypes = projectTypes;
            if (statusList) objData.statusList = statusList;
            if (hearingtypes) objData.hearingtypes=hearingtypes;

        } catch (e) {
            log.error('onRequestFxn', 'ERROR : ' + e);
        }
        context.response.write(JSON.stringify(objData));
    }
    return {
        onRequest: onRequestFxn
    };

});