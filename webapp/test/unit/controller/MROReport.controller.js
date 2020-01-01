/*global QUnit*/

sap.ui.define([
	"cie/mro_report/controller/MROReport.controller"
], function (Controller) {
	"use strict";

	QUnit.module("MROReport Controller");

	QUnit.test("I should test the MROReport controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});