/**
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 */

define(['N/https', 'N/record', 'N/search','N/file'], function (https, record, search,file) {



    function lookUpParkings(rcdid, pin) {
        var objParking = {};
         objParking.error='';
        try {

            var parkingcitation = record.load({
                type: 'customrecord_gs_pkng_parkingcitation',
                id: rcdid
            });
            log.debug('searchLicence', 'rcdid------: ' +rcdid);
            log.debug('searchLicence', 'pin------: ' + pin);
            log.debug('searchLicence', 'parkingcitation------: ' + parkingcitation);
            if (parkingcitation) {

                var transaction = parkingcitation.getText('custrecord_gs_pviol_transaction');
                transactionPin = transaction.split('-')[1];
               var masterPin=parkingcitation.getValue('custrecord_gs_coo_master_pin');
                log.debug('searchLicence', 'transactionPin------: ' + transactionPin);
                log.debug('searchLicence', 'masterPin------: ' + masterPin);
                if (transactionPin == pin || masterPin == pin) {
                   var imgs=[]
                    objParking.invoice = parkingcitation.getValue('custrecord_gs_pviol_transaction');
                    objParking.invoiceText = parkingcitation.getText('custrecord_gs_pviol_transaction');
                    objParking.licenseplate = parkingcitation.getText('custrecord_gs_coo_licenseplate');
                    objParking.manufacturer = parkingcitation.getText('custrecord_gs_coo_parking_manufacturer');
                    objParking.style = parkingcitation.getText('custrecord_gs_coo_parking_style');
                    objParking.color = parkingcitation.getText('custrecord_gs_coo_parking_color');
                    if(parkingcitation.getValue('custrecord_gs_coo_picture'))imgs.push(parkingcitation.getValue('custrecord_gs_coo_picture'))
                    if(parkingcitation.getValue('custrecord_gs_pviol_picturetwo'))imgs.push(parkingcitation.getValue('custrecord_gs_pviol_picturetwo'))
                    if(parkingcitation.getValue('custrecord_gs_pviol_picturethree'))imgs.push(parkingcitation.getValue('custrecord_gs_pviol_picturethree'))
                    if(parkingcitation.getValue('custrecord_gs_pviol_picturefour'))imgs.push(parkingcitation.getValue('custrecord_gs_pviol_picturefour'))
                    log.audit('imgs',imgs);
                    if(imgs.length > 0)imgs=imgUrl(imgs);
                     objParking.imgs=imgs;

                    var transactionSearchObj = search.create({
                        type: "transaction",
                        filters:
                        [
                           ["internalid","anyof",objParking.invoice]
                        ],
                        columns:
                        ['entity']
                     });
                     var resultSet = transactionSearchObj.run();
                     var results = resultSet.getRange({
                        start: 0,
                        end: 1
                    });
                     log.debug('searchLicence', 'transactionSearchObj >>>: ' + results.length);
                     objParking.customer=results[0].getValue('entity');
                     log.debug('searchLicence', 'transactionSearchObj------: ' + objParking.customer);
                }else{
                    objParking.error="Pin does not match";
                }

                log.debug('searchLicence', 'objParking------: ' + JSON.stringify(objParking));
              
                return objParking;
            }

        } catch (e) {
            log.error('lookUpLicenses', 'ERROR : ' + e);
        }
        log.debug('searchLicence', 'objParking------: ' + JSON.stringify(objParking));
        return objParking;
    }

    function imgUrl(imgs){
        var arr=[]
        for(var i=0;i<imgs.length;i++){
            var fileObj = file.load({
                id: imgs[i]
            });
           if(fileObj) arr.push(fileObj.url);
        }
     return arr;
    }



    function onRequestFxn(context) {

        try {
            var message = '';
            var params = context.request.parameters;
            log.audit('onRequestFxn', 'Context parameters : ' + JSON.stringify(params));
            var recordId = params.recordId;
            var pin = params.pin;
            log.audit('onRequestFxn', 'Context parameters recordId: '+ recordId);
            log.audit('onRequestFxn', 'Context parameters pin : '+ pin);

            if (recordId && pin) {

                var objRespose;
                objRespose = lookUpParkings(recordId, pin);

            }
            if (objRespose && !objRespose.error) {
                log.audit('invoiceRcd', JSON.stringify(objRespose));
                context.response.write(JSON.stringify(objRespose));
            } else {
                context.response.write(JSON.stringify({ message: 'There are no results for this Parking Citation or Pin Number' }));
            }

        } catch (e) {

            context.response.write(JSON.stringify({ message: 'There are no results for this Parking Citation Number . Try again.' }));
        }

    }

    return {
        onRequest: onRequestFxn
    };
});