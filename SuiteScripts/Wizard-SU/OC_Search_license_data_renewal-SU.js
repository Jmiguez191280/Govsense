/**
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 */

define(['N/https', 'N/record', 'N/search'], function (https, record, search) {



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

    function searchLicence(context, invoiceRcd, invoice) {

        // log.audit('getFunction', 'Context object : ' +
        // JSON.stringify(context));
        try {
            var objData = {};
            if (invoiceRcd) {
                //log.audit('showSearchPage', 'Context parameters : ' + JSON.stringify(params));



                var invoiceId = invoice;
                var licenseId = invoiceRcd.getValue('createdfrom');
                var license = invoiceRcd.getText('createdfrom');
                var customerId = invoiceRcd.getValue('entity');

                log.audit('invoiceRcd', invoiceRcd);
                if (licenseId) {

                    var obj = lookUpLicenses(licenseId);
                    objData.name = obj.businessName;
                    objData.license = license;
                    objData.location = obj.location;
                    
                }
                objData.customerId = customerId;
                objData.invoice = invoiceId

            }
        } catch (e) {
            log.audit('Error', 'searchLicence: ' + JSON.stringify(e));
        }

        // context.response.write(JSON.stringify(objData));
       return objData
    }

    function onRequestFxn(context) {

        try {
            var message = '';
            var params = context.request.parameters;
            log.audit('onRequestFxn', 'Context parameters : ' + JSON.stringify(params));
            var invId = params.invId;
            log.audit('onRequestFxn', 'invId : ' + invId);
            var invoiceRcd = record.load({
                type: 'invoice',
                id: invId
            });

            if(invoiceRcd){
            var dateCompare = '06/01/' + new Date().getFullYear();
            dateCompare = Date.parse(dateCompare);
            var date = invoiceRcd.getValue('trandate');
            date = Date.parse(date)
            var amauntDue = invoiceRcd.getValue('amountremainingtotalbox');
            log.audit('invoiceRcd', invoiceRcd);
        var objRespose;
        log.audit('parseFloat(amauntDue)', parseFloat(amauntDue));
            if (dateCompare < date && parseFloat(amauntDue) > 0) objRespose=searchLicence(context, invoiceRcd, invId);
            if (dateCompare > date) message = 'The Renewal ID you entered is not valid for this fiscal year.'
            if (parseFloat(amauntDue) == 0) message ='The Renewal ID you entered is not valid for this fiscal year or has already been paid. Please refer to your records or contact the City (link to Contact Us page) with any additional questions'
            }
             if(objRespose){
                log.audit('invoiceRcd', JSON.stringify(objRespose));
                context.response.write(JSON.stringify(objRespose));
             }else{
                context.response.write(JSON.stringify({ message:message}));
             } 
             
        } catch (e) {
            log.error('onRequestFxn', 'ERROR : ' + e);
            log.audit('msge', 'message: There are no results for this Renewal ID. Try again.');
            context.response.write(JSON.stringify({ message: 'There are no results for this Renewal ID. Try again.' }));
        }
       
    }

    return {
        onRequest: onRequestFxn
    };
});