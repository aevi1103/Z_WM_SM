sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/library",
	"sap/m/Dialog",
	"../model/formatter"
], function (Controller, UIComponent, mobileLibrary, Dialog, formatter) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return Controller.extend("com.federalmogul.Z_WM_SM.controller.BaseController", {
		
		formatter: formatter,
		
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel : function (sName) {
			return sName ? this.getView().getModel(sName) : this.getView().getModel();
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel : function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		
		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle : function () {
			return this.getOwnerComponent().getModel("i18n");
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress : function () {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},
		
		getId: function(sName) {
			return this.getView().byId(sName);
		},
		
		setBindingContext: function(oContext, sContextName){
			return this.getView().setBindingContext(oContext, sContextName);
		},
		
		getBindingContext: function(sContextName){
			return this.getView().getBindingContext(sContextName);
		},
		
		showBigDialog: function(sTitle, sMsg, isSuccess = true){
			
			const state = isSuccess ? "Success" : "Error";
			const iconSrc = isSuccess ? "sap-icon://message-success" : "sap-icon://decline";
			const iconColor = isSuccess ? "green" : "red";
			
			const oDialog = new Dialog({
					title: sTitle,
					type: "Message",
					state: state,
					stretch: true,
					stretchOnPhone: true,
					horizontalScrolling: false,
					verticalScrolling: false,
					width: "100%",
					contentWidth: "100%",
					contentHeight: "100%",
					content: [
						new sap.m.FlexBox({
							justifyContent: "Center",
							alignItems: "Center",
							heigth: "100%",
							width: "100%",
							direction: "Column",
							alignContent: "SpaceAround",
							items: [
								new sap.ui.core.Icon({
									src: iconSrc,
									size: "1000%",
									color: iconColor
								}),
								new sap.m.Text({
									text: sMsg
								})
							]
						})
					],
					beginButton : new sap.m.Button({
						text : "OK",
						press : function(){
							oDialog.close();
						}
					}),
					afterClose: function() {
						oDialog.destroy();
					}
			});
			
			oDialog.open();
			
			return oDialog;
			
		},
		
		showBusyDialog: function(sTitle, sText){
			return new sap.m.BusyDialog({
				title: sTitle,
				text: sText
			});
		},
		
		setValueState: function(oSource, sValue= "", errorMsg = ""){
			if (sValue) {
				oSource.setValueState("Success");
			} else {
				oSource.setValueState("Error");
				oSource.setValueStateText(errorMsg);
			}
			return oSource;
		},
		
		resetField: function(oSource){
			
			const type = oSource.getMetadata().getName();
			
			switch (type) {
				
				case "sap.m.Input":
					oSource.setValue("");
					oSource.setValueState("None");
					break;
					
				case "sap.m.ComboBox":
					oSource.setSelectedKey("");
					oSource.setValueState("None");
					break;
					
				case "sap.m.Text":
					oSource.setText("");
					break;
				
			}
			
			return oSource;
			
		},
		
		getElapseTimeFromTimeStamp: function(timestamp) {
			
			const structure = {
				year: 31536000,
				month: 2592000,
				week: 604800,
				day: 86400,
				hour: 3600,
				minute: 60,
				second: 1
			};
			
			const now = Date.now(); //in milliseconds
			const deltaInillisecond = timestamp - now; //in milliseconds
			let deltaInSecondAbs = Math.abs(deltaInillisecond) / 1000; //convert to second
			
		    let res = {
		    	timestamp,
		    	now,
		    	isPastDue: deltaInillisecond < 0 ? true : false,
		    	deltaInillisecond,
		    	deltaInSecondAbs
		    };
		    
		    /*
		    loop through each time structure and convert the absolute value of delta into each time structure.
		    get the floored value in each loop
		    convert the result back to millisecond, then subtract that value from the absolute delta to gte the remaining time the repeat process.
		    */
		    
			for(let key in structure) {
		        res[key] = Math.floor(deltaInSecondAbs / structure[key]); //converts the delta into structure key and get only the floored value 
		        deltaInSecondAbs -= res[key] * structure[key]; //get the converted value then convert back to millisecond then subtract the difference from the orifinal delta
		    }
		    
		    return res;
			
		}
		
	});

});