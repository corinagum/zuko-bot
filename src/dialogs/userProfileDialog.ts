import {
  ChoiceFactory,
  ChoicePrompt,
  ComponentDialog,
  ConfirmPrompt,
  DialogSet,
  DialogTurnStatus,
  NumberPrompt,
  TextPrompt,
  WaterfallDialog
} from 'botbuilder-dialogs';

import { UserProfile } from '../userProfile';
import { WatchDirectoryFlags } from 'typescript';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const USER_PROFILE = 'USER_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class UserProfileDialog extends ComponentDialog {
  constructor(userState, logger) {
    super('userProfileDialog');

    this.userProfile = userState.createProperty(USER_PROFILE);

    this.logger = logger;

    this.addDialog(new TextPrompt(NAME_PROMPT));
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
    this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
    this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.agePromptValidator));

    this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
      this.transportStep.bind(this),
      this.nameStep.bind(this),
      this.nameConfirmStep.bind(this),
      this.ageStep.bind(this),
      this.confirmStep.bind(this),
      this.summaryStep.bind(this)
    ]));

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  async transportStep(step) {
    // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog
    // Running a prompt here means the next WaterfallStep will be run when the uesrs reponse is received.

    return await step.prompt(CHOICE_PROMPT, {
      prompt: 'Please enter your mode of transport.',
      choices: ChoiceFactory.toChoices(['Car', 'Bus', 'Bicycle', 'Other'])
    });
  }

  async nameStep(step) {
    step.values.name = step.result;

    // We can send messages to the user at any point in the WaterfallStep
    await step.context.sendActivity(`Thanks ${ step.result }.`);

    return await step.prompt(CONFIRM_PROMPT, 'Do you want to give your age', ['yes', 'no']);
  }

  async ageStep(step) {
    if (step.result) {
      // User said yes so we will prompt for age
      // WaterFallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
      const promptOptions = {
        prompt: 'Please enter your age.',
        retryPrompt: 'The value entered must be greater than 0 and less than 150'
      }

      return await step.prompt(NUMBER_PROMPT, promptOptions);
    } else {
      // User said no so we will skip this step. Give -1 as the age.
      return await step.next(-1);
    }
  }

  async confirmStep(step) {
    step.values.age = step.result;

    const msg = step.values.age === -1 ? 'No age given' : `I have your age as $ step.values.age.`;

    // We can send messages to the user at any point in the WaterfallStep

    await step.context.SendActivity(msg);

    // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog
    return await step.prompt(CONFIRM_PROMPT, {
      prompt: 'Is this okay?'
    });
  }

  async summaryStep(step) {
    if (step.result) {
      // Get the current profile object from user state
      const userProfile = await this.userProfile.get(step.context, new UserProfile());

      userProfile.transport = step.values.transport;
      userProfile.name = step.values.name;
      userProfile.age = step.values.age;

      let msg = `I have your mode of transport as ${ userProfile.transport } and your name as ${ userProfile.name }.`

      if (userProfile.age !== -1) {
        msg += ` And your age is ${ userProfile.age }.`;
      }

      await step.context.sendActivity(msg);
    } else {
      await step.context.sendActivity('Thanks. Your profile has been discarded.');
    }

    // WaterfallStep always finishes with the end of the Waterfall or with another dialog. Here it is the end
    return await step.endDialog();
  }

  async agePromptValidator(promptContext) {
    // This condition is our validation rule. You can also change the value at this point
    return promptContext.recognized.succeeded && promptContext.recognized.value > 0 && promptContext.recognized.value < 150;
  }
}

export default UserProfileDialog;