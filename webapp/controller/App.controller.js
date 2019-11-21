sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.federalmogul.Z_WM_SM.controller.App", {
		
		onInit: function () {
			
		},
		
		onAfterRendering: function(){
			
			
			
		},
		
		getDateNow: function(){
			const newDate = new Date(Date.now());
			const dateNow = `${newDate.toDateString()} ${newDate.toTimeString()}`;
			return dateNow;
		},
		
		onSmartTableInit: function(oEvent){
			
			//rebind table every 1 minute after table is initialized
			setInterval(() => {
				const smartTable = this.byId("smartTable");
				smartTable.rebindTable();
			}, (1 * 60000));

		},
		
		onBeforeRebindTbl: function(oEvent){
			
			console.log('smart table before rebind', oEvent)
			
			const msg = this.byId("idTextTime");
			msg.setText(`Last updated on ${this.getDateNow()}`);
			
		},
		
		formatRowHighlight: function (nHuCount, nHuLoaded) {

			//green: 90 - 100%;
			//yellow: 50 - 90%
			// < 50% red
			
			const ninetyPercent = Number(nHuCount.trim()) * .9;
			const fiftyPercent = Number(nHuCount.trim()) * .5;
			
			if (nHuLoaded === nHuCount) return "Success";
			
			if (nHuLoaded < fiftyPercent) {
				return "Error";
			} else if (nHuLoaded >= fiftyPercent && nHuLoaded <= ninetyPercent) {
				return "Warning";
			} else {
				return "Success";
			}
			
			
		}
		
		
	});
});