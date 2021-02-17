/**
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 */

define(['N/https', 'N/record', 'N/search', 'N/file'], function (https, record, search, file) {

    function getCitationRcdForLegacyNumber(id) {
      
        var customrecord_gs_pkng_parkingcitationSearchObj = search.create({
            type: "customrecord_gs_pkng_parkingcitation",
            filters:
                [
                    [["isinactive", "is", "F"], "AND", ["custrecord_gs_coo_legacynumber","is",id]]
                ],
            columns:
                [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "ID"
                    }),
                    search.createColumn({ name: "scriptid", label: "Script ID" }),
                    search.createColumn({ name: "name", label: "Name" }),
                    search.createColumn({ name: "custrecord_gs_pviol_licenseplate", label: "License Plate" }),
                    search.createColumn({ name: "custrecord_gs_pviol_lpstate", label: "License Plate Issuance State" }),
                    search.createColumn({ name: "custrecord_gs_pviol_parkingviolator", label: "Violator" }),
                    search.createColumn({ name: "custrecord_gs_pviol_citationstatus", label: "Citation Status" }),
                    search.createColumn({ name: "custrecord_gs_pviol_transaction", label: "Transaction" }),
                    search.createColumn({ name: "custrecord_gs_pviol_citationnotes", label: "Citation Notes" }),
                    search.createColumn({ name: "custrecord_gs_pviol_violationarea", label: "Violation Area" }),
                    search.createColumn({ name: "custrecord_gs_coo_parking_style", label: "Vehicle Style" }),
                    search.createColumn({ name: "custrecord_gs_coo_parking_color", label: "Vehicle Color" }),
                    search.createColumn({ name: "custrecord_gs_coo_master_pin", label: "Master pin" }),
                    search.createColumn({ name: "custrecord_gs_coo_picture", label: "Picture #1" }),
                    search.createColumn({ name: "custrecord_gs_pviol_picturetwo", label: "Picture #2" }),
                    search.createColumn({ name: "custrecord_gs_pviol_picturethree", label: "Picture #3" }),
                    search.createColumn({ name: "custrecord_gs_pviol_picturefour", label: "Picture #4" }),
                    search.createColumn({name: "custrecord_gs_coo_parking_manufacturer", label: "Vehicle Manufacturer"}),
                    search.createColumn({name: "custrecord_gs_coo_licenseplate", label: "Vehicle / License Plate"}),
                ]
        });
        
        var myResultSet = customrecord_gs_pkng_parkingcitationSearchObj.run()
        var resultRange = myResultSet.getRange({
            start: 0,
            end: 1
        });
        log.debug('getCitationRcd', 'forName.length------: ' + resultRange.length);
        log.debug('getCitationRcd', 'forName.length------: ' + resultRange[0]);
        return resultRange;
    }

    function getCitationRcdForId(pId) {
       var id='PV-'+pId;
      log.debug('getCitationRcdForId id', id);
        var customrecord_gs_pkng_parkingcitationSearchObj = search.create({
            type: "customrecord_gs_pkng_parkingcitation",
            filters:
                [
                  ["isinactive", "is", "F"], "AND", ["idtext","is",id]
                ],
            columns:
                [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "ID"
                    }),
                    search.createColumn({ name: "scriptid", label: "Script ID" }),
                    search.createColumn({ name: "name", label: "Name" }),
                    search.createColumn({ name: "scriptid", label: "Script ID" }),
                    search.createColumn({ name: "custrecord_gs_pviol_transaction", label: "Transaction" }),
                    search.createColumn({ name: "custrecord_gs_coo_parking_style", label: "Vehicle Style" }),
                    search.createColumn({ name: "custrecord_gs_coo_parking_color", label: "Vehicle Color" }),
                    search.createColumn({ name: "custrecord_gs_coo_master_pin", label: "Master pin" }),
                    search.createColumn({ name: "custrecord_gs_coo_licenseplate", label: "Vehicle / License Plate" }),
                    search.createColumn({ name: "custrecord_gs_coo_parking_manufacturer", label: "Vehicle Manufacturer" }),
                    search.createColumn({ name: "custrecord_gs_coo_picture", label: "Picture #1" }),
                    search.createColumn({ name: "custrecord_gs_pviol_picturetwo", label: "Picture #2" }),
                    search.createColumn({ name: "custrecord_gs_pviol_picturethree", label: "Picture #3" }),
                    search.createColumn({ name: "custrecord_gs_pviol_picturefour", label: "Picture #4" })
                ]
        });
      
        var myResultSet = customrecord_gs_pkng_parkingcitationSearchObj.run()
        var resultRange = myResultSet.getRange({
            start: 0,
            end: 1
        });
        log.debug('getCitationRcd', 'ForId.length------: ' + resultRange.length);
        return resultRange;
    }

    function lookUpParkings(rcdid, pin) {
        var objParking = {};
        objParking.error = '';
        try {
            var parkingcitation;
            // var parkingcitation = record.load({
            //     type: 'customrecord_gs_pkng_parkingcitation',
            //     id: rcdid
            // });
            //test
            var parkingcitationId = getCitationRcdForId(rcdid);
            log.debug('parkingcitationId', parkingcitationId);
            if (!parkingcitationId || parkingcitationId.length == 0) {
                parkingcitationId = getCitationRcdForLegacyNumber(rcdid);
                if (parkingcitationId) parkingcitation = parkingcitationId;
            } else {
                parkingcitation = parkingcitationId;
            }

            if (!parkingcitation || parkingcitation.length == 0) return null;
            log.debug('searchLicence', 'rcdid------: ' + rcdid);
            log.debug('searchLicence', 'pin------: ' + pin);

            if (parkingcitation) {

                var transaction = parkingcitation[0].getText('custrecord_gs_pviol_transaction');
                transactionPin = transaction.split('-')[1];
                var masterPin = parkingcitation[0].getValue('custrecord_gs_coo_master_pin');
                var recordName = parkingcitation[0].getValue('name')
                log.debug('searchLicence', 'transactionPin------: ' + transactionPin);
                log.debug('searchLicence', 'masterPin------: ' + masterPin);
                log.debug('searchLicence', 'recordName------: ' + recordName);
                if (pin) {
                    if (transactionPin == pin || masterPin.toUpperCase() == pin.toUpperCase()) {
                        var imgs = []
                        objParking.invoice = parkingcitation[0].getValue('custrecord_gs_pviol_transaction');
                        objParking.invoiceText = parkingcitation[0].getText('custrecord_gs_pviol_transaction');
                        objParking.licenseplate = parkingcitation[0].getValue('custrecord_gs_coo_licenseplate');
                        objParking.manufacturer = parkingcitation[0].getText('custrecord_gs_coo_parking_manufacturer');
                        objParking.style = parkingcitation[0].getText('custrecord_gs_coo_parking_style');
                        objParking.color = parkingcitation[0].getText('custrecord_gs_coo_parking_color');
                        if (parkingcitation[0].getValue('custrecord_gs_coo_picture')) imgs.push(parkingcitation[0].getValue('custrecord_gs_coo_picture'))
                        if (parkingcitation[0].getValue('custrecord_gs_pviol_picturetwo')) imgs.push(parkingcitation[0].getValue('custrecord_gs_pviol_picturetwo'))
                        if (parkingcitation[0].getValue('custrecord_gs_pviol_picturethree')) imgs.push(parkingcitation[0].getValue('custrecord_gs_pviol_picturethree'))
                        if (parkingcitation[0].getValue('custrecord_gs_pviol_picturefour')) imgs.push(parkingcitation[0].getValue('custrecord_gs_pviol_picturefour'))
                        log.audit('imgs', imgs);
                        if (imgs.length > 0) imgs = imgUrl(imgs);
                        objParking.imgs = imgs;

                        var transactionSearchObj = search.create({
                            type: "transaction",
                            filters:
                                [
                                    ["internalid", "anyof", objParking.invoice]
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
                        objParking.customer = results[0].getValue('entity');
                        log.debug('searchLicence', 'transactionSearchObj------: ' + objParking.customer);
                    }
                } else {
                    objParking.error = "Pin does not match";
                }

                log.debug('searchLicence', 'objParking1------: ' + JSON.stringify(objParking));

                return objParking;
            }

        } catch (e) {
            log.error('lookUpLicenses', 'ERROR : ' + e);
        }
        log.debug('searchLicence', 'objParking2------: ' + JSON.stringify(objParking));
        return objParking;
    }

    function imgUrl(imgs) {
        var arr = []
        for (var i = 0; i < imgs.length; i++) {
            var fileObj = file.load({
                id: imgs[i]
            });
            if (fileObj) arr.push(fileObj.url);
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
            log.audit('onRequestFxn', 'Context parameters recordId: ' + recordId);
            log.audit('onRequestFxn', 'Context parameters pin : ' + pin);

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