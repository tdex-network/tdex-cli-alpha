// Helpers
import { info, log, error, success } from '../logger';
import { isValidUrl, OperatorClient } from '../helpers';
// State
import State from '../state';
const state = new State();

export default function (endpoint: string): void {
  info('=========*** Operator ***==========\n');

  if (!isValidUrl(endpoint))
    return error('The provided endpoint URL is not valid');

  const grpc = new OperatorClient(endpoint);

  grpc
    .waitForReady()
    .then(() => {
      state.set({
        operator: {
          selected: true,
          endpoint,
        },
      });

      success(`Connection to the given daemon has been successful!`);
      log(
        `Every operator sub-command, such as operator deposit, will be run against this daemon endpoint`
      );
      log(`Current daemon endpoint: ${endpoint}`);
      return;
    })
    .catch(error);
}
