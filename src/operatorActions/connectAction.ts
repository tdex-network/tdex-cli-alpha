// Helpers
import { info, log, error } from '../logger';
import { isValidUrl, OperatorClient } from '../helpers';
// State
import State from '../state';
const state = new State();

export default function (endpoint: string): void {
  info('=========*** Operator ***==========\n');

  if (!isValidUrl(endpoint))
    return error('The provided endpoint URL is not valid');

  const grpc = new OperatorClient(endpoint);

  grpc.waitForReady()
    .then(() => {
      state.set({
        operator: {
          selected: true,
          endpoint
        },
      });

      return log(`Current operator endpoint: ${endpoint}`);
    })
    .catch(error);
}
