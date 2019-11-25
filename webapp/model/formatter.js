sap.ui.define([], function () {
	"use strict";

	return {

		numberUnit : function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		
		numberUnitNoDecimal : function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(0);
		},
		
		formatCurrency : function (nValue) {
			var f = sap.ui.core.format.NumberFormat.getCurrencyInstance();
			return f.format(nValue)
		},
		
		formatToUpperCase: function(sVal) {
			return sVal.toUpperCase();
		},
		
		formatDate : function (oDate) {
			const f = sap.ui.core.format.DateFormat.getDateInstance({
				style: 'short',
				type: 'sap.ui.model.type.Date'
			});
			return f.format(oDate);
		},
		
		formatShortDate : function (oDate) {
			
			if (!oDate) return null;
			const f = sap.ui.core.format.DateFormat.getDateInstance({
				style: "short",
				type: "sap.ui.model.type.Date",
	 			formatOptions: {
	 				UTC: true
	 			}
			});
			return f.format(oDate);
		},
		
		formatTime	: function(time) {                                                            
			var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern: "HH:mm:ss"});
			var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;                             
			var timeStr = timeFormat.format(new Date(time.ms + TZOffsetMs));                      
			return timeStr;                                                                       
		}
		

	};

});