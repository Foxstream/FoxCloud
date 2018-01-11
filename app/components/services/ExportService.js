/**
 * @class ExportService
 * @memberOf FSCounterAggregatorApp
 * @description Allow formatting and exporting raw data
 */
(function() {

    angular.module('FSCounterAggregatorApp').service('ExportService', [

        function() {

            var colSeparator = ";";
            var lineSeparator = "\n";

            function formatField(fieldName) {
                return fieldName == 'time' ?
                    moment(this.time * 1000).format('YYYY-MM-DD HH:mm:ss') :
                    this[fieldName];
            }

            function convertRawElementToCsvLine(prefix, elementsToExport, rawElement) {
                return prefix +
                    _(elementsToExport)
                    .map(formatField.bind(rawElement))
                    .join(colSeparator);
            }

            function getColumnsToExport(obj) {
                return _.without(_.keys(obj), "occ");
            }

            this.ConvertDataToCSV = function(myData, sitesConf) {
                var firstDataAvailable = _(myData)
                    .map(function(x) { return x.data; })
                    .flatten()
                    .nth(0);

                var elementsToExport = getColumnsToExport(firstDataAvailable);
                var header = "Site" + colSeparator + _.join(elementsToExport, colSeparator) + lineSeparator;

                var rawDataToExport = _(myData)
                    .map(function(siteData) {
                        var site = _.find(sitesConf, { id: siteData.id });
                        var siteName = '"' + (site ? site.name || 'n/a' : 'n/a') + '"';

                        return _(siteData.data)
                            .map(convertRawElementToCsvLine.bind(null, siteName + colSeparator, elementsToExport))
                            .join(lineSeparator);
                    })
                    .join(lineSeparator);

                return header + rawDataToExport;
            };

            //cf. http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side#24922761
            this.ProposeToDownload = function(content, fileName, mimeType) {
                var a = document.createElement('a');
                mimeType = mimeType || 'application/octet-stream';

                if (navigator.msSaveBlob) { // IE10
                    navigator.msSaveBlob(new Blob([content], {
                        type: mimeType
                    }), fileName);
                } else if (URL && 'download' in a) { //html5 A[download]                   
                    a.href = URL.createObjectURL(new Blob([content], {
                        type: mimeType
                    }));
                    a.setAttribute('download', fileName);
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                } else {
                    location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
                }
            };
        }
    ]);
})();