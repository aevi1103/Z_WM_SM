sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.federalmogul.Z_WM_SM.controller.App", {
		
		onInit: function () {
			
		},
	
		onAfterRendering: function(){
			
			const model = this.getModel();
			const path = "/SHIPMENTSet()";
			
			model.read(path, {
				success: function(oData){
					console.log(path,oData);
				},
				filters: [new sap.ui.model.Filter("Tplst", sap.ui.model.FilterOperator.EQ, "201S")] 
			});

		},
		
		/*
		Utils
		------------------------------------------------------------------------------------------------------
		*/
		
		getDateNow: function(){
			const newDate = new Date(Date.now());
			const dateNow = `${newDate.toDateString()} ${newDate.toTimeString()}`;
			return dateNow;
		},
		
		setLogo : function(logoName, fnSuccess){
			
			const model = this.getModel();
			const path = `/LOGOSet('${logoName}')`;
			model.read(path, {
				success : function(oData){
					const {Content} = oData;
					const src = `data:image/bmp;base64,${Content}`;
					fnSuccess(src);
				}, 
				error : function(error){
					console.error(error.message);
				}
				
			});
		},
		
		/*
		Methods
		------------------------------------------------------------------------------------------------------
		*/
		
		onSmartTableInit: function(){
			//rebind table every 1 minute after table is initialized
			setInterval(() => this.byId("smartTable").rebindTable(), (1 * 60000));
		},
		
		onBeforeRebindTbl: function(){
			const msg = this.byId("idTextTime");
			msg.setText(`Last updated on ${this.getDateNow()}`);
		},
		
		onUpdateFinished: function(oEvent){
			
			console.log(`table updated at ${this.getDateNow()}`);
			
			let statusIndicator = null;
			let timeToLoadObjectStat = null;
			
			let huCount = 0;
			let huPicked = 0;
			let plannedDate = null;
			let plannedTime = null;
			
			const rows = oEvent.getSource().getItems();
			rows.forEach(row => { 
				row.getCells().forEach(cell => { 
					
					//get Hu count and picked ans save to a binding
					let pathName = "";
					if (cell.getBindingInfo("text")){
						pathName = cell.getBindingInfo("text").binding.sPath;
						if (pathName === "HuCount") {
							huCount = cell.getText();
						}
						if (pathName === "HusPicked") {
							huPicked = cell.getText();
						}
						if (pathName === "Dplbg") {
							plannedDate = cell.getText();
						}
					}
					
					//get obj of status indicator
					if (cell.getMetadata().getName() === "sap.suite.ui.commons.statusindicator.StatusIndicator") {
						statusIndicator = cell;
					}
					
					//when all bindings are complete update status indicator
					if (statusIndicator && huCount && huPicked) {
						const eff = this.formatHuEfficiency(huCount, huPicked);
						statusIndicator.setValue(eff);
						//reset
						statusIndicator = null;
						huCount = 0;
						huPicked = 0;
					}
					
					//if obj is an image get its alt value and get image binary
					if (cell.getMetadata().getName() === "sap.m.Image") {
						const logoName = cell.getAlt();
						if (logoName) {
							this.setLogo(logoName, src => cell.setSrc(src));
						}
					}
					
					//get planned time from custom data key
					const isPlannedTime = cell.getAggregation("customData").some(aggregation => aggregation.getProperty("key") === "Uplbg");
					if (isPlannedTime) {
						plannedTime = cell.getText();
					}
					
					//get object status object based on custom data key
					const isTimeLoad = cell.getAggregation("customData").some(aggregation => aggregation.getProperty("key") === "timeToLoad");
					if (isTimeLoad) {
						timeToLoadObjectStat = cell;
					}
					
					//check if planned date time and ibj stat is defined
					if (plannedDate && plannedTime && timeToLoadObjectStat) {
						
						const text = this.formatObjectStatusText(plannedDate, plannedTime, true);
						const state = this.formatObjectStatusState(plannedDate, plannedTime, true);
						const icon = this.formatObjectStatusIcon(plannedDate, plannedTime, true);
						
						//set values
						timeToLoadObjectStat.setText(text);
						timeToLoadObjectStat.setState(state);
						timeToLoadObjectStat.setIcon(icon);
						
						console.log({plannedDate, plannedTime, text})
						
						//reset
						plannedDate = null;
						plannedTime = null;
						timeToLoadObjectStat = null;
						
					}
					
				});
				
				
				
			});
			
			
		},

		/*
		Formatters
		------------------------------------------------------------------------------------------------------
		*/
		
		getElapsedTime: function(plannedDate, plannedTime, isFormatted = false){
		
			if (plannedDate) {
				
				let date;
				let time;
				
				if (!isFormatted) {
					date = this.formatter.formatDate(plannedDate);
					time = this.formatter.formatTime(plannedTime);
				} else {
					date = plannedDate;
					time = plannedTime;
				}
				
				const shipmentDateTimeStamp = new Date(`${date} ${time}`).getTime();
				const elapsed = this.getElapseTimeFromTimeStamp(shipmentDateTimeStamp);
				// console.log(elapsed);
				return elapsed;
			}
			
			return "";
			
		},
		
		getDateInterval: function(value, type){
			
			const pluralize = number => number > 1 ? 's' : '';
			let result = '';
			
			switch (type) {
				case "d": 
					result = `${value} day`;
					break;
				case "h":
					result = `${value} hour`;
					break;
				case "m":
					result = `${value} minute`;
					break;
				case "s":
					result = `${value} second`;
					break;
			}
			
			return result + pluralize(value);
			
		},
		
		formatObjectStatusText: function(plannedDate, plannedTime, isFormatted = false){
			if (!plannedDate) return "";
			const { isPastDue, day, hour, minute } = this.getElapsedTime(plannedDate, plannedTime, isFormatted);
			const pastDue = isPastDue ? " - Past Due" : "";
			return `${this.getDateInterval(day, "d")} ${this.getDateInterval(hour, "h")} ${this.getDateInterval(minute, "m")} ${pastDue}`;
		},
		
		formatObjectStatusState: function(plannedDate, plannedTime, isFormatted = false){
			
			if (!plannedDate) return "None";
			const { isPastDue, day, hour } = this.getElapsedTime(plannedDate, plannedTime, isFormatted);
			
			if (isPastDue) {
				
				return "Error";
				
			} else {
				
				if (day == 0) {
					if (hour <= 1) {
						return "Error";
					} else {
						return "Warning";
					}
				}
				
				return "Success";
			}
			
		},
		
		formatObjectStatusIcon: function(plannedDate, plannedTime, isFormatted = false){
			
			if (!plannedDate) return "";
			const { isPastDue, day, hour } = this.getElapsedTime(plannedDate, plannedTime, isFormatted);
			
			if (isPastDue) {
				
				return "sap-icon://alert";
				
			} else {
				
				if (day == 0) {
					if (hour <= 1) {
						return "sap-icon://alert";
					} else {
						return "sap-icon://message-warning";
					}
				}
				
				return "";
			}
			
		},
		
		formatPlannedTime: function(plannedDate, plannedTime) {
			if (!plannedDate) return "";
			const time = this.formatter.formatTime(plannedTime);
			return time;
		},

		formatRowHighlight: function (nHuCount, nHuPicked) {

			//green: 60 - 100%;
			//yellow: 30 - 60%
			// < 30% red
			
			const max = Number(nHuCount.trim()) * .6;
			const min = Number(nHuCount.trim()) * .3;
			
			if (nHuPicked === nHuCount) { return "Success"; }
			
			if (nHuPicked < min) {
				return "Error";
			} else if (nHuPicked >= min && nHuPicked <= max) {
				return "Warning";
			} else {
				return "Success";
			}
	
		},
		
		formatHuEfficiency: function(nHuCount, nHuPicked) {
			
			if (!nHuCount || !nHuPicked) return 0;
			
			if (nHuPicked >= nHuCount) {
				return 100;
			} else {
				
				const eff = Number(nHuCount.trim()) === 0 
								? 0 
								: Number(nHuPicked.trim()) / Number(nHuCount.trim());
								
				const effPercent = Math.ceil((eff * 100));
				return effPercent;
				
			} 
			
			
		}
		
		
	});
});