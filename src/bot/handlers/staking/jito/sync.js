import { JitoService } from '../../../../modules/staking/jito.js';
import { logger } from '../../../../shared/logger.js';

export async function syncJitoUnstakes(chatId, storage) {
  try {
    const wallets = await storage.getWallets(chatId);
    const solWallet = wallets.find((w) => w.chain === 'sol');
    if (!solWallet) return 0;

    const requests = await storage.getUnstakeRequests(chatId);
    const blockchainExits = await JitoService.getPendingStandardExits(solWallet.address);

    if (!blockchainExits.success || blockchainExits.pending.length === 0) return 0;

    let importedCount = 0;
    for (const exit of blockchainExits.pending) {
      const alreadyTracked = requests.some((r) => r.stakeAccountAddress === exit.address);
      if (!alreadyTracked) {
        const pendingLocal = requests.find(
          (r) => !r.stakeAccountAddress && r.walletAddress === solWallet.address
        );

        if (pendingLocal) {
          await storage.updateUnstakeRequest(chatId, pendingLocal.id, {
            stakeAccountAddress: exit.address,
            status: exit.status,
            estimatedAvailableAt: exit.estimatedAvailableAt,
          });
          importedCount++;
        } else {
          await storage.addUnstakeRequest(chatId, {
            amount: exit.amountSOL / 1.07,
            walletId: solWallet.id,
            walletAddress: solWallet.address,
            stakeAccountAddress: exit.address,
            status: exit.status,
            estimatedAvailableAt: exit.estimatedAvailableAt,
            label: 'Blockchain Auto-Import',
          });
          importedCount++;
        }
      } else {
        const existing = requests.find((r) => r.stakeAccountAddress === exit.address);
        if (existing && (exit.estimatedAvailableAt || exit.status)) {
          await storage.updateUnstakeRequest(chatId, existing.id, {
            estimatedAvailableAt: exit.estimatedAvailableAt || existing.estimatedAvailableAt,
            status: exit.status || existing.status,
          });
        }
      }
    }
    return importedCount;
  } catch (e) {
    logger.logError(e, { context: 'syncJitoUnstakes', chatId });
    return 0;
  }
}
