sap.ui.define([
	"./BaseController",
	"./designMode",
	"./messages",
	"sap/ui/model/json/JSONModel",
	"sap/ui/export/Spreadsheet",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Token",
	"sap/m/MessageToast"
], function (BaseController,designMode,messages,JSONModel,Spreadsheet,Filter,FilterOperator,Token,MessageToast) {
	"use strict";
	var interval = 0;
	
	return BaseController.extend("cie.mro_report.controller.MROReport", {
		//my git
		// formatter : formatter,		
		onInit: function () {
			this.getView().addStyleClass("sapUiSizeCompact");
			this._ResourceBundle = this.getModel( "i18n" ).getResourceBundle();			
			this._JSONModel = new JSONModel();
			this.setModel(this._JSONModel);
			// this._JSONModel = this.getModel();			
			var oView = this.getView();
			var filter = function(sTerm, oItem) {
				return oItem.getText().match(new RegExp(sTerm, "i")) || 
                       oItem.getKey().match(new RegExp(sTerm, "i")) ||
                       oItem.getAdditionalText().match(new RegExp(sTerm, "i")) ;                         
			};
			oView.byId("materialNo").setFilterFunction(filter);
			oView.byId("plant").setFilterFunction(filter);
			oView.byId("storageLocation").setFilterFunction(filter);			
			var fValidator = function(args){
				var text = args.text;
				return new Token({key: text, text: text});
			};
			oView.byId("materialNo").addValidator(fValidator);
			oView.byId("plant").addValidator(fValidator);
			oView.byId("storageLocation").addValidator(fValidator);
			oView.byId("storageBin").addValidator(fValidator);
			oView.byId("materialType").addValidator(fValidator);
			this.getInitData();		
			this.language = this.getLanguage();
		},
		//******************************************************************************//			
		// init Date Range
		getInitData: function () {
			var mro_report = {
				PurchasingDocument: "",
				ConditionRecord: "",
				CompanyCode: "",
				PurchasingOrganization: "",
				PurchasingGroup: "",
				Supplier: "",
				PurchasingDocumentItem: "",
				Material: "",
				ConditionValidityStartDate: "",
				ConditionValidityEndDate: "",
				ConditionRateValue: "",
				ConditionRateValueUnit: "",
				ConditionQuantity: "",
				ConditionQuantityUnit: ""
			};
			var mro_reportItemSet = [];
			this._JSONModel.setProperty("/mro_report", mro_report);
			this._JSONModel.setProperty("/mro_reportItemSet", mro_reportItemSet);
		},		
		onAfterRendering: function() {
			this.initMatF4Help();
			this.initPlantF4Help();
			this.initStorageLocationF4Help();
			this.initStorageBinF4Help();
			this.initMaterialTypeF4Help();
		},
		//******************************************************************************//	
				// 采购组织搜索帮助
		initPlantF4Help : function(){
			var that = this;
			var jsonModel = new JSONModel();
			var jUrl = "/destinations/S4HANACLOUD_BASIC/YY1_PLANT_F4HELP_CDS/YY1_PLANT_F4HELP";
			jsonModel.attachRequestCompleted(function(){
				var plantF4Set = this.getProperty("/d/results");
				// var hash = {}; 
				// documentF4Set = documentF4Set.reduce(function(preVal, curVal){
				//  hash[curVal.SchedulingAgreement] ? '' : hash[curVal.SchedulingAgreement] = true && preVal.push(curVal); 
				//  return preVal 
				// }, []);
				that._JSONModel.setProperty("/plantF4Set",plantF4Set);
				that.byId("plant").setBusy(false);
				sap.ui.getCore().byId("ZPlant_TTable").setBusy(false);
			});
			jsonModel.loadData(jUrl,null,true);
			this.byId("plant").setBusy(true);
			if(!this._PlantDialog){
				this._PlantDialog = sap.ui.xmlfragment("cie.mro_report.dialog.plant", this);
				designMode.syncStyleClass(this.getView(), this._PlantDialog);
				this.getView().addDependent(this._PlantDialog);
				// sap.ui.getCore().byId("ZLINEITEM_TTable").setBusy(true);
			}			
		},
		
					// 采购组织搜索帮助
		initStorageBinF4Help : function(){
			var that = this;
			var jsonModel = new JSONModel();
			var jUrl = "/destinations/S4HANACLOUD_BASIC/YY1_StorageBIN_CDS/YY1_StorageBIN?$filter=WarehouseStorageBin ne ''";
			jsonModel.attachRequestCompleted(function(){
				var storageBinF4Set = this.getProperty("/d/results");
				var hash = {}; 
				storageBinF4Set = storageBinF4Set.reduce(function(preVal, curVal){
				 hash[curVal.WarehouseStorageBin] ? '' : hash[curVal.WarehouseStorageBin] = true && preVal.push(curVal); 
				 return preVal 
				}, []);
				that._JSONModel.setProperty("/storageBinF4Set",storageBinF4Set);
			});
			jsonModel.loadData(jUrl,null,true);
			if(!this._StorageBinDialog){
				this._StorageBinDialog = sap.ui.xmlfragment("cie.mro_report.dialog.storageBin", this);
				designMode.syncStyleClass(this.getView(), this._StorageBinDialog);
				this.getView().addDependent(this._StorageBinDialog);
				// sap.ui.getCore().byId("ZLINEITEM_TTable").setBusy(true);
			}			
		},
				/**
		 * 行项目搜索帮助
		 * sUrl = "YY1_ProductTypeText";//
					oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_PRODUCTTYPETEXT_CDS";//
		 */
		 
		initMaterialTypeF4Help : function(){
			var that = this;
			var jsonModel = new JSONModel();
			var filter="?$filter=Language eq '"+this.language+"'";
			var jUrl = "/destinations/S4HANACLOUD_BASIC/YY1_PRODUCTTYPETEXT_CDS/YY1_ProductTypeText"+filter;
			// var query = "$select=SchedulingAgreementItem";
			jsonModel.attachRequestCompleted(function(){
				var materialTypeF4Set = this.getProperty("/d/results");
					var hash = {}; 
				materialTypeF4Set = materialTypeF4Set.reduce(function(preVal, curVal){
				 hash[curVal.ProductType] ? '' : hash[curVal.ProductType] = true && preVal.push(curVal); 
				 return preVal 
				}, []);
				that._JSONModel.setProperty("/materialTypeF4Set",materialTypeF4Set);
			});
			jsonModel.loadData(jUrl,null,true);
			if(!this._MaterialTypeDialog){
				this._MaterialTypeDialog = sap.ui.xmlfragment("cie.mro_report.dialog.materialType", this);
				designMode.syncStyleClass(this.getView(), this._MaterialTypeDialog);
				this.getView().addDependent(this._MaterialTypeDialog);
			}			
		},
		/**
		 * 行项目搜索帮助
		 */
		initStorageLocationF4Help : function(){
			var that = this;
			var jsonModel = new JSONModel();
			var jUrl = "/destinations/S4HANACLOUD_BASIC/YY1_STORAGE_LOCATION_CDS/YY1_Storage_location";
			// var query = "$select=SchedulingAgreementItem";
			jsonModel.attachRequestCompleted(function(){
				var storageLocationF4Set = this.getProperty("/d/results");
				// 	var hash = {}; 
				// storageLocationF4Set = storageLocationF4Set.reduce(function(preVal, curVal){
				//  hash[curVal.SchedulingAgreementItem] ? '' : hash[curVal.SchedulingAgreementItem] = true && preVal.push(curVal); 
				//  return preVal 
				// }, []);
				that._JSONModel.setProperty("/storageLocationF4Set",storageLocationF4Set);
				// that.byId("lineItem").setBusy(false);
			});
			jsonModel.loadData(jUrl,null,true);
			// this.byId("lineItem").setBusy(true);
			if(!this._StorageLocationDialog){
				this._StorageLocationDialog = sap.ui.xmlfragment("cie.mro_report.dialog.storageLocation", this);
				designMode.syncStyleClass(this.getView(), this._StorageLocationDialog);
				this.getView().addDependent(this._StorageLocationDialog);
				// sap.ui.getCore().byId("ZSTORAGELOCATION_TTable").setBusy(true);
			}			
		},
		
		
		initMatF4Help : function(){
			var that = this;
			var jsonModel = new JSONModel();
			var jUrl = "/destinations/S4HANACLOUD_BASIC/YY1_PRODUCT_F4HELP_CDS/YY1_Product_F4Help";
			var query = "$select=Product,ProductDescription";
			jsonModel.attachRequestCompleted(function(){
				that._JSONModel.setProperty("/matF4Set",this.getProperty("/d/results"));
				sap.ui.getCore().byId("ZMATERIAL_TTable").setBusy(false);
			});
			jsonModel.loadData(jUrl,query,true);
			if(!this._MatDialog){
				this._MatDialog = sap.ui.xmlfragment("cie.mro_report.dialog.material", this);
				designMode.syncStyleClass(this.getView(), this._MatDialog);
				this.getView().addDependent(this._MatDialog);
				sap.ui.getCore().byId("ZMATERIAL_TTable").setBusy(true);
			}
		},	
		// Supplier Search Help
		initSupplierF4Help : function(){
			var that = this;
			var jsonModel = new JSONModel();
			var jUrl = "/destinations/S4HANACLOUD_BASIC/YY1_SUPPLIERHELP_CDS/YY1_SupplierHelp";
			var query = "$select=Supplier,SupplierName";
			jsonModel.attachRequestCompleted(function(){
				that._JSONModel.setProperty("/vendorF4Set",this.getProperty("/d/results"));
				sap.ui.getCore().byId("ZVENDOR_TTable").setBusy(false);
			});
			jsonModel.loadData(jUrl,query,true);
			if(!this._VenDialog){
				this._VenDialog = sap.ui.xmlfragment("cie.mro_report.dialog.supplier", this);
				designMode.syncStyleClass(this.getView(), this._VenDialog);
				this.getView().addDependent(this._VenDialog);
				sap.ui.getCore().byId("ZVENDOR_TTable").setBusy(true);
			}			
		},
		//******************************************************************************//			
		// OnSearch 
		onSearch: function(){
			var that = this;
			that.byId("table").setBusy(true);		
			var sUrl = "/YY1_MRO_MANAGEMENT_API?$orderby=Material,Plant,StorageLocation";
			var oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_MRO_MANAGEMENT_API_CDS";
			var ODataModel = new sap.ui.model.odata.ODataModel(oDataUrl);	
			var materialNo = that.byId("materialNo").getTokens();
			var storageLocation = that.byId("storageLocation").getTokens();
			var plant = that.byId("plant").getTokens();			
			var storageBin = that.byId("storageBin").getTokens();
			var materialType = that.byId("materialType").getTokens();
			
			
			var allFilters = [];		
			var i,k;
			if(materialNo.length>0){
				for(i=0;i<materialNo.length;i++){
					/* eslint-disable sap-no-ui5base-prop */					
					allFilters.push(new Filter('Material', sap.ui.model.FilterOperator.EQ, materialNo[i].mProperties.key));
					/* eslint-disable sap-no-ui5base-prop */					
				}
			}		
			if(plant.length>0){
				for(k=0;k<plant.length;k++){
					allFilters.push(new Filter('Plant', sap.ui.model.FilterOperator.EQ, plant[k].mProperties.key));
				}
			}		
			if(storageLocation.length>0){
				for(k=0;k<storageLocation.length;k++){
					allFilters.push(new Filter('StorageLocation', sap.ui.model.FilterOperator.EQ, storageLocation[k].mProperties.key));
				}
			}			
			if(storageBin.length > 0){
				for(k=0;k<storageBin.length;k++){
					allFilters.push(new Filter('WarehouseStorageBin', sap.ui.model.FilterOperator.EQ, storageBin[k].mProperties.key));
				}
			}
			if(materialType.length > 0){
				for(k=0;k<materialType.length;k++){
					allFilters.push(new Filter('ProductType', sap.ui.model.FilterOperator.EQ, materialType[k].mProperties.key));
				}
			}
			var mParameters = {
				filters: allFilters,
				success: function (oData) {
					var Arry = oData.results;
					if (Arry.length > 0) {
						var item = null;
						var MRO_ListSet = [];
						for(var r = 0; r < Arry.length; r++){
							if(item !== null){
								if(item.Material === Arry[r].Material &&
									item.Plant === Arry[r].Plant &&
									item.StorageLocation === Arry[r].StorageLocation){
										item.MatlWrhsStkQtyInMatlBaseUni+=	parseFloat(Arry[r].MatlWrhsStkQtyInMatlBaseUni);
										item.SafetyStockQuantity+=	parseFloat(Arry[r].SafetyStockQuantity);
								}else{
									item.MatlWrhsStkQtyInMatlBaseUni =	parseFloat(	item.MatlWrhsStkQtyInMatlBaseUni).toFixed(3);
									item.SafetyStockQuantity =	parseFloat(item.SafetyStockQuantity).toFixed(3);
									MRO_ListSet.push(item);
									item = null;
									item = Arry[r];
									item.MatlWrhsStkQtyInMatlBaseUni = parseFloat(item.MatlWrhsStkQtyInMatlBaseUni);     
									item.SafetyStockQuantity = parseFloat(item.SafetyStockQuantity);
								}
							}else{
								item = Arry[r];
								item.MatlWrhsStkQtyInMatlBaseUni = parseFloat(item.MatlWrhsStkQtyInMatlBaseUni);     
								item.SafetyStockQuantity = parseFloat(item.SafetyStockQuantity);
							}
						}
						item.MatlWrhsStkQtyInMatlBaseUni =	parseFloat(	item.MatlWrhsStkQtyInMatlBaseUni).toFixed(3);
						item.SafetyStockQuantity =	parseFloat(item.SafetyStockQuantity).toFixed(3);
						MRO_ListSet.push(item);
						that._JSONModel.setProperty("/results",MRO_ListSet);
					
						var length = MRO_ListSet.length;
						var loopTime = Math.ceil(length/50);
						that.loopTime = loopTime;
						that.materialDesc=[];
						that.materialTypeDesc=[];
						that.materialGroupDesc=[];
						for(var i = 0; i < loopTime; i++){
								var flag = "";
								if(i === loopTime -1 ){
									flag = "X";
								}
								var sourceArr = [];
								for(var j = i*50; j < (i+1)*50; j++){
									if(j < length){
										sourceArr.push(MRO_ListSet[j]);
									}
								}
								var hash1 = {}; 
								var arr1 = sourceArr.reduce(function(preVal, curVal){
								 hash1[curVal.Material] ? '' : hash1[curVal.Material] = true && preVal.push(curVal); 
								 return preVal; 
								}, []);
								that.getDescription("material",i,arr1);
								var hash2 = {}; 
								var arr2 = sourceArr.reduce(function(preVal, curVal){
								 hash2[curVal.ProductType] ? '' : hash2[curVal.ProductType] = true && preVal.push(curVal); 
								 return preVal; 
								}, []);
								that.getDescription("materialType",i,arr2);
								var hash3 = {}; 
								var arr3 = sourceArr.reduce(function(preVal, curVal){
									hash3[curVal.ProductGroup] ? '' : hash3[curVal.ProductGroup] = true && preVal.push(curVal); 
									return preVal; 
								}, []);
								that.getDescription("materialGroup",i, arr3 );
							}
					
					}else{
						that._JSONModel.setProperty("/MRO_ListSet",[]);
						messages.showText("No Data!");						
					} 
				
				},
				error: function (oError) {
					that.byId("table").setBusy(false);
					var messageText = $(oError.response.body).find('message').first().text();						
						messages.showODataErrorText( messageText );		
				}
			};
			ODataModel.read(sUrl, mParameters);			
		},
		/**
		 * 数据填充
		 */
		
		//******************************************************************************//
		// Get SchedulingAgreementHead
		openMaterial :function(){
			this._MatDialog.open();
		},
		onCancelAction:function(){
			//取消按钮事件
			this._MatDialog.close();
		},
		
		openMaterialType :function(){
			this._MaterialTypeDialog.open();
		},
		onCancelActionMT:function(){
			//取消按钮事件
			this._MaterialTypeDialog.close();
		},
		
		openPlant :function(){
			this._PlantDialog.open();
		},
		onCancelActionPlant:function(){
			this._PlantDialog.close();
		},
		
		openStorageBin:function(){
			this._StorageBinDialog.open();
		},
		onCancelActionStorageBin:function(){
			this._StorageBinDialog.close();
		},
		// 所有搜索帮助进行本地的过滤
		onMatF4Search : function(evt){
			var aFilters = [];
			var query = evt.getSource().getValue();
			var queryId = evt.getParameter("id");
			/*queryId = queryId.split("--")[1];*/
			var QueryValue = queryId.split("-");
			if(query && query.length > 0){
				var afilter = [];
				var i;
				for(i=0;i<QueryValue.length;i++){
					afilter.push(new Filter(QueryValue[i], sap.ui.model.FilterOperator.Contains, query));				
				}
				var allFilters = new Filter(afilter, false);// false为并集
				aFilters.push(allFilters);
			}
			var binding =  this._MatDialog.getContent()[0].getContent()[1].getBinding("items");
			binding.filter(aFilters);
		},
		onMaterialTypeF4Search:function(evt){
			var aFilters = [];
			var query = evt.getSource().getValue();
			var queryId = evt.getParameter("id");
			/*queryId = queryId.split("--")[1];*/
			var QueryValue = queryId.split("-");
			if(query && query.length > 0){
				var afilter = [];
				var i;
				for(i=0;i<QueryValue.length;i++){
					afilter.push(new Filter(QueryValue[i], sap.ui.model.FilterOperator.Contains, query));				
				}
				var allFilters = new Filter(afilter, false);// false为并集
				aFilters.push(allFilters);
			}
			var binding =  this._MaterialTypeDialog.getContent()[0].getContent()[1].getBinding("items");
			binding.filter(aFilters);
		
		},
		onWarehouseStorageBinF4Search:function(evt){
			var aFilters = [];
			var query = evt.getSource().getValue();
			var queryId = evt.getParameter("id");
			/*queryId = queryId.split("--")[1];*/
			var QueryValue = queryId.split("-");
			if(query && query.length > 0){
				var afilter = [];
				var i;
				for(i=0;i<QueryValue.length;i++){
					afilter.push(new Filter(QueryValue[i], sap.ui.model.FilterOperator.Contains, query));				
				}
				var allFilters = new Filter(afilter, false);// false为并集
				aFilters.push(allFilters);
			}
			var binding =  this._StorageBinDialog.getContent()[0].getContent()[1].getBinding("items");
			binding.filter(aFilters);
		
		},
		onConfirmAction : function(){
			var oMultiInput1 = this.getView().byId("materialNo");
			oMultiInput1.removeAllTokens();
			var dataArr =this._MatDialog.getContent()[0].getContent()[1].getSelectedItems();
			if(dataArr.length === 0){
				messages.showText( "No data selected" );
				return;
			}else{
				for(var i=0;i<dataArr.length;i++){
					var text = 	dataArr[i].mAggregations.cells[0].mProperties.text;
					oMultiInput1.addToken(new Token({key: text, text: text}));
				}
			}
			this.onCancelAction();
		},
		
		onConfirmActionMT:function(){
			var oMultiInput1 = this.getView().byId("materialType");
			oMultiInput1.removeAllTokens();
			var dataArr =this._MaterialTypeDialog.getContent()[0].getContent()[1].getSelectedItems();
			if(dataArr.length === 0){
				messages.showText( "No data selected" );
				return;
			}else{
				for(var i=0;i<dataArr.length;i++){
					var text = 	dataArr[i].mAggregations.cells[0].mProperties.text;
					oMultiInput1.addToken(new Token({key: text, text: text}));
				}
			}
			this.onCancelActionMT();
		
		},
		onConfirmActionStorageBin:function(){
			var oMultiInput1 = this.getView().byId("storageBin");
			oMultiInput1.removeAllTokens();
			var dataArr =this._StorageBinDialog.getContent()[0].getContent()[1].getSelectedItems();
			if(dataArr.length === 0){
				messages.showText( "No data selected" );
				return;
			}else{
				for(var i=0;i<dataArr.length;i++){
					var text = 	dataArr[i].mAggregations.cells[0].mProperties.text;
					oMultiInput1.addToken(new Token({key: text, text: text}));
				}
			}
			this.onCancelActionStorageBin();
		},
		
		onConfirmActionPlant : function(){
			var oMultiInput1 = this.getView().byId("plant");
			oMultiInput1.removeAllTokens();
			var dataArr =this._PlantDialog.getContent()[0].getContent()[1].getSelectedItems();
			if(dataArr.length === 0){
				messages.showText( "No data selected" );
				return;
			}else{
				for(var i=0;i<dataArr.length;i++){
					var text = 	dataArr[i].mAggregations.cells[0].mProperties.text;
					oMultiInput1.addToken(new Token({key: text, text: text}));
				}
			}
			this.onCancelActionPlant();
		},
		
		//******************************************************************************//		
		openStorageLocation :function(){
			this._StorageLocationDialog.open();
		},
		onCancelActionSL:function(){
			this._StorageLocationDialog.close();	
		},
		// 所有搜索帮助进行本地的过滤
		onSLF4Search : function(evt){
			var aFilters = [];
			var query = evt.getSource().getValue();
			var queryId = evt.getParameter("id");
			var QueryValue = queryId.split("-");
			if(query && query.length > 0){
				var afilter = [];
				var i;
				for(i=0;i<QueryValue.length;i++){
					afilter.push(new Filter(QueryValue[i], sap.ui.model.FilterOperator.Contains, query));				
				}
				var allFilters = new Filter(afilter, false);// false为并集
				aFilters.push(allFilters);
			}
			var binding =  this._StorageLocationDialog.getContent()[0].getContent()[1].getBinding("items");
			binding.filter(aFilters);
		},
		/**
		 *单据livechange
		 */
		onPlantF4Search : function(evt){
			var aFilters = [];
			var query = evt.getSource().getValue();
			var queryId = evt.getParameter("id");
			var QueryValue = queryId.split("-");
			if(query && query.length > 0){
				var afilter = [];
				var i;
				for(i=0;i<QueryValue.length;i++){
					afilter.push(new Filter(QueryValue[i], sap.ui.model.FilterOperator.Contains, query));				
				}
				var allFilters = new Filter(afilter, false);// false为并集
				aFilters.push(allFilters);
			}
			var binding =  this._PlantDialog.getContent()[0].getContent()[1].getBinding("items");
			binding.filter(aFilters);
		},
		
		onConfirmActionSL : function(){
			var oMultiInput1 = this.getView().byId("storageLocation");
			var dataArr =this._StorageLocationDialog.getContent()[0].getContent()[1].getSelectedItems();
			if(dataArr.length === 0){
				messages.showText( "No data Seletecd" );
				return;
			}else{
				for(var i=0;i<dataArr.length;i++){
				var text = 	dataArr[i].mAggregations.cells[0].mProperties.text;
				oMultiInput1.addToken(new Token({key: text, text: text}));
					
				}
			}
			this.onCancelActionSL();
		},
		/**
		 * 导出excel
		 */
		onExportExcel:function(){
			var aCols, aProducts, oSettings, oSheet;
			aCols = this.createColumnConfig();
			aProducts = this._JSONModel.getProperty("/MRO_ListSet");
			oSettings = {
				fileName: "MRO Report",
				workbook: { columns: aCols },
				dataSource: aProducts
			};
			oSheet = new Spreadsheet(oSettings);
			oSheet.build().then( function() {
				// messages.showText("Spreadsheet export has finished");
			});
		
		 
		},
		
			createColumnConfig: function() {
			return [//构造导出列
					{
						label: 'Material No.',//物料号
						property: 'Material',
						type: 'string'
					},
					{
						label: 'Material Desc.',//物料描述
						property: 'ProductDescription',
						type: 'string'
					},
					{
						label: 'Material Type',//物料类型
						property: 'ProductType',
						type: 'string'
					},
					{
						label: 'Material Type Name',//物料类型描述
						property: 'MaterialTypeName',
						type: 'string'
					},
					{
						label: 'Material Group',//物料分组
						property: 'ProductGroup',
						type: 'string'
					},
					{
						label: 'Material Group Name',//物料分组描述
						property: 'ProductGroupName',
						type: 'string'
					},
					{
						label: 'Plant',//工厂
						property: 'Plant',
						type: 'number',
					},
					{
						label: 'Storage Location',//库存地点
						property: 'StorageLocation',
						type: 'number',
					},
					{
						label: 'Storage BIN',//
						property: 'WarehouseStorageBin',
						type: 'number',
					},
					{
						label: 'Batch No.',//批次号
						property: 'Batch',
						type: 'number',
					},
					{
						label: 'Quatity',//数量
						property: 'MatlWrhsStkQtyInMatlBaseUni',
						type: 'string'
					},
					{
						label: 'Unit',//单位
						property: 'MaterialBaseUnit',
						type: 'string'
					},
					{
						label: 'Safety Stock',//安全库存数
						property: 'SafetyStockQuantity',
						type: 'string'
					},
					{
						label: 'Material Classification',//物料分类
						property: 'ABCIndicator',
						type: 'string'
					},
					{
						label: 'Priority',//优先级
						property: 'Priority',
						type: 'string'
					}
				];
		},
		
		/**
		 * get material Desc./material type Desc./material group Desc.
		 */
		getDescription:function(type,index,arr){
			var allFilters = [];
			var sUrl="";
			var oDataUrl="";
			allFilters.push(new Filter({
				path:"Language",
				operator: FilterOperator.EQ,
				value1: this.language
			}));
			
			switch(type){
				case "material":
					sUrl = "YY1_ProductDescription";//
					oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_ProductDescription_CDS";//
					if(arr.length > 0){
						for(var m = 0; m < arr.length; m++){
							allFilters.push(new Filter({
								path:"Product",
								operator: FilterOperator.EQ,
								value1: arr[m].Material
							}));
						}
					}
					break;
				case "materialType":
					sUrl = "YY1_ProductTypeText";//
					oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_PRODUCTTYPETEXT_CDS";//
					if(arr.length > 0){
						for(var t = 0; t < arr.length; t++){
							allFilters.push(new Filter({
								path:"ProductType",
								operator: FilterOperator.EQ,
								value1: arr[t].ProductType
							}));
						}
					}
					break;
				case "materialGroup":
					sUrl = "YY1_ProductGroupText_2";//
					oDataUrl = "/destinations/S4HANACLOUD_BASIC/YY1_PRODUCTGROUPTEXT_2_CDS";//
					if(arr.length > 0){
						for(var g = 0; g < arr.length; g++){
							allFilters.push(new Filter({
								path:"ProductGroup",
								operator: FilterOperator.EQ,
								value1: arr[g].ProductGroup
							}));
						}
					}
					break;
				default:
					break;
			}
			var ODataModel = new sap.ui.model.odata.ODataModel(oDataUrl);
			var mParameters = {
				filters: allFilters,
				success: function (oData, response) {
					var results = oData.results;
					var descriptionSet = null;
					var that = this;
					var loopTime = this.loopTime;
					switch(type){
						case "material":
								descriptionSet = this._JSONModel.getProperty("/materialDescSet");
								this.materialDesc.push(index);
								
								for(var i = 0; i < loopTime; i++){
									if(this.materialDesc.indexOf(i) === -1){
										this.materialFlag="";
										break;
									}
									if(i === loopTime -1){
										this.materialFlag="X";
										if(interval===0){
											interval = setInterval(function(){
												that.classifyData();
											}, 500);
										}
									}
								}
							break;
						case "materialType":
								this._JSONModel.setProperty("/materialTypeDescSet",oData.results);
								this.materialTypeDesc.push(index);
								for(var i = 0; i < loopTime; i++){
									if(this.materialTypeDesc.indexOf(i) === -1){
										this.materialTypeFlag="";
										break;
									}
									if(i === loopTime -1){
										this.materialTypeFlag="X";
										if(interval===0){
											interval = setInterval(function(){
												that.classifyData();
											}, 500);
										}
									}
								}
							break;
						case "materialGroup":
								this._JSONModel.setProperty("/materialGroupDescSet",oData.results);
								this.materialGroupDesc.push(index);
								for(var i = 0; i < loopTime; i++){
									if(this.materialGroupDesc.indexOf(i) === -1){
										this.materialGroupFlag="";
										break;
									}
									if(i === loopTime -1){
										this.materialGroupFlag="X";
										if(interval===0){
											interval = setInterval(function(){
												that.classifyData();
											}, 500);
										}
									}
								}
							break;
						default:
						break;
					}
					if(results.length>0){
						if(descriptionSet !== undefined && descriptionSet !== null){
							for(var i =0; i < results.length; i++){
								descriptionSet.push(results[i]);
							}	
						}else{
							descriptionSet = results;
						}
						switch(type){
							case "material":
								this._JSONModel.setProperty("/materialDescSet",descriptionSet);
								break;
							case "materialType":
									this._JSONModel.setProperty("/materialTypeDescSet",descriptionSet);
								break;
							case "materialGroup":
									this._JSONModel.setProperty("/materialGroupDescSet",descriptionSet);
								break;
							default:
							break;
						}			
					}else{
						MessageToast.show(this._ResourceBundle.getText("noData"));	
					}
				}.bind(this),
				error: function (oError) {
				}.bind(this)
			};
			ODataModel.read(sUrl, mParameters);
		
		},
		/**
		   * get log on laguange
		   */
		getLanguage: function(){
			var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			switch (sLanguage) {
				case "zh-Hant":
					sLanguage = "ZF";
					break;
				case "zh-Hans":
				case "zh-CN":
					sLanguage = "ZH";
				break;
			case "EN":
				sLanguage = "EN";
				break;
			default:
				break;
			}
			return sLanguage;
		},
		/**
		 * 填充描述字段
		 */
		 classifyData:function(){
		 	if(this.materialFlag === "X"&&
		 	this.materialTypeFlag==="X"&&
		 	this.materialGroupFlag==="X"){
		 		clearInterval(interval);
		 		interval = 0;
		 		var materialDescSet = this._JSONModel.getProperty("/materialDescSet");
		 		var materialTypeDescSet = this._JSONModel.getProperty("/materialTypeDescSet");
		 		var materialGroupDescSet = this._JSONModel.getProperty("/materialGroupDescSet");
		 		var	MRO_ListSet = this._JSONModel.getProperty("/results");
		 		if(MRO_ListSet.length>0){
		 			for(var i = 0; i < MRO_ListSet.length; i++){
		 				//获取物料描述
		 				for(var m = 0; m < materialDescSet.length; m++){
		 					if(MRO_ListSet[i].Material === materialDescSet[m].Product){
		 						MRO_ListSet[i].ProductDescription  = materialDescSet[m].ProductDescription;
		 						break;
		 					}
		 				}
		 				//获取物料类型描述
		 				for(var t = 0; t < materialTypeDescSet.length; t++){
		 					if(MRO_ListSet[i].ProductType === materialDescSet[t].ProductType){
		 						MRO_ListSet[i].MaterialTypeName = materialDescSet[t].MaterialTypeName;	
		 						break;
		 					}
		 				}
		 				//获取物料组描述
		 				for(var g = 0; g < materialGroupDescSet.length; g++){
		 					if(MRO_ListSet[i].ProductGroup === materialDescSet[g].ProductGroup){
		 						MRO_ListSet[i].ProductGroupName = materialDescSet[g].ProductGroupText;
		 						break;
		 					}
		 				}
		 				
		 			}
		 			
		 			this._JSONModel.setProperty("/MRO_ListSet",MRO_ListSet);
		 			this.byId("table").setBusy(false);	
		 		}
					 
		 	}
		 }

	});
});