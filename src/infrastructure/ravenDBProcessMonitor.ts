import { documentStore } from '../database/ravenDb'
import { IDocumentStore, PutCompareExchangeValueOperation, DeleteCompareExchangeValueOperation } from 'ravendb'
import moment from 'moment-timezone'


class DistributedLockObject
{
    public ExpiresAt: Date|null = null
}

export class RavenDbProcessMonitor
{
    async lockResource(lockKey: string):Promise<number>
    {
        while (true)
        {
            var now = moment().tz("UTC").toDate();

            var lockObject = new DistributedLockObject();
            lockObject.ExpiresAt = moment().tz("UTC").add(15, 'minutes').toDate();

            var result = await documentStore.operations.send(
                new PutCompareExchangeValueOperation<DistributedLockObject>(
                    lockKey, lockObject, 0)
                );

            if (result.successful)
            {
                // resourceName wasn't present - we managed to reserve
                return result.index;
            }

            if (result.value.ExpiresAt < now)
            {
                // Time expired - Update the existing key with the new value
                var takeLockWithTimeoutResult = await documentStore.operations.send(
                    new PutCompareExchangeValueOperation<DistributedLockObject>(lockKey, lockObject, result.index));

                if (takeLockWithTimeoutResult.successful)
                {
                    return takeLockWithTimeoutResult.index;
                }
            }
            
            // Wait a little bit and retry
            this.snooze(50);
        }
    }
    async releaseResource(lockKey: string , lockIndex: number )
    {
        await documentStore.operations.send(
            new DeleteCompareExchangeValueOperation<DistributedLockObject>(
                lockKey, 
                lockIndex)
                );
    }
            
    snooze = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));
}