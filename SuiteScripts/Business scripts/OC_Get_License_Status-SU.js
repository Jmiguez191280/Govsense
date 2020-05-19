/**
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 */

define(['N/https', 'N/record', 'N/email', 'N/search', 'N/file', './handlebars-v4.0.5.js'], function(https, record, email, search, file, hb) {


    function onRequestFxn(context) {

        try {

            var arrRetVal = [];


            var rs = search.create({
                type: 'customlistgs_coo_lisencestatuslist',
                columns: [search.createColumn({
                    name: "internalid",
                }), search.createColumn({
                    name: "name"
                })]
            });

            var searchResultCount = rs.runPaged().count;
            log.debug('getListValues', 'result count : ' + searchResultCount);

            rs.run().each(function(result) {

                arrRetVal.push({
                    id: result.id,
                    name: result.getValue('name')
                });
                return true;
            });

        } catch (e) {
            log.error('getLicenseStatus', 'ERROR : ' + e);
        }


        context.response.write(JSON.stringify((arrRetVal)));
    }

    return {
        onRequest: onRequestFxn
    };
});