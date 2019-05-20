/* eslint-disable */

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');
const MOD2MEDICINE = 'prednisone';
const STARTDATE = new Date('May 18, 2019 16:00:00') // Factors in UTC time difference; May 19, 2019 00:00:00

class DialogBot extends ActivityHandler {
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     * @param {any} logger object for logging events, defaults to console if none is provided
     */
    constructor(conversationState, userState, dialog, logger) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');
        if (!logger) {
            logger = console;
            logger.log('[DialogBot]: logger not passed in, defaulting to console');
        }

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.logger = logger;
        this.dialogState = this.conversationState.createProperty('DialogState');
        this.medicineState = this.userState.createProperty('MedicineState');

        this.onMessage(async (context, next) => {
            this.logger.log('Running dialog with Message Activity.');

            // Run the Dialog with the new message Activity.
            // await this.dialog.run(context, this.dialogState);

            const medicineRegex = new RegExp(/medicine/gi)

            if (context.activity.text.match(medicineRegex)) {
                // cache is stored in context; state management object is in storage provider?!?!!?
                const medicineStateHistory = await this.medicineState.get(context, { mod2Med: MOD2MEDICINE, startDate: STARTDATE });

                const response = medicineStateHistory ? "Today Zuko should have Atopica (stinky grey capsule) and Ketowhatever (1/2 white circular pill)" : "Today Zuko needs prednisone (orange pill)";

                await context.sendActivity(response);

                // every time someone checks medicine, we flip the value

                await this.medicineState.set(context, !medicineStateHistory);
            }

            await next();
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });
    }
}

module.exports.DialogBot = DialogBot;
