/**
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 */

define(['N/https', 'N/record', 'N/search'], function(https, record, search) {



    function lookUpLicenses(licenseId) {
        var objLicence = {};
        try {

            var licenceceRcd = record.load({
                type: 'salesorder',
                id: licenseId
            });

            if (licenceceRcd) {
                objLicence.businessName = licenceceRcd.getText('entity');
                objLicence.location = licenceceRcd.getText('custbody_gs_lic_spatiallocation');

            }

        } catch (e) {
            log.error('lookUpLicenses', 'ERROR : ' + e);
        }
        log.audit('searchLicence', 'objLicence: ' + JSON.stringify(objLicence));
        return objLicence;
    }

    function searchLicence(context,invoiceRcd, invoice) {

        // log.audit('getFunction', 'Context object : ' +
        // JSON.stringify(context));
        try {
            var objData = {};
            if (invoiceRcd) {
                //log.audit('showSearchPage', 'Context parameters : ' + JSON.stringify(params));

               

                var invoiceId = invoice;
                var licenseId = invoiceRcd.getValue('createdfrom');
                var license = invoiceRcd.getText('createdfrom');
                var customerId=invoiceRcd.getValue('entity');


                if (licenseId) {

                    var obj = lookUpLicenses(licenseId);
                    objData.customerId=customerId;
                    objData.name = obj.businessName;
                    objData.license = license;
                    objData.location = obj.location;
                    objData.invoice = invoiceId

                }
            }
        } catch (e) {
            log.audit('Error', 'searchLicence: ' + JSON.stringify(e));
        }
       
        context.response.write(JSON.stringify(objData));

    }

    function onRequestFxn(context) {

        try {
            
            var params = context.request.parameters;
            log.audit('onRequestFxn', 'Context parameters : ' + JSON.stringify(params));
            var invId = params.invId;
            log.audit('onRequestFxn', 'invId : ' + invId);
            var invoiceRcd = record.load({
                type: 'invoice',
                id: invId
            });


            searchLicence(context,invoiceRcd, invId);

        } catch (e) {
            log.error('onRequestFxn', 'ERROR : ' + e);
          context.response.write(JSON.stringify({}));
        }
    }
    return {
        onRequest: onRequestFxn
    };
});