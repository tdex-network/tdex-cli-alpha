// Helpers
import { info, log, error } from '../logger';
import { OperatorClient } from '../helpers';
// State
import State from '../state';
const state = new State();

export default function (cmdObj: any): void {
  info('=========*** Operator ***==========\n');

  const { operator } = state.get();

  if (!operator.selected)
    return error('Select a valid operator gRPC interface');

  const grpc = new OperatorClient(operator.endpoint);

  if (cmdObj.fee) {
    grpc
      .feeDepositAddress()
      .then((address: string) => {
        return log(`[Fee] address: ${address}`);
      })
      .catch(error);
  } else {
    grpc
      .depositAddress()
      .then((address: string) => {
        return log(`[Market] address: ${address}`);
      })
      .catch(error);
  }
}
