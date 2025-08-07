import { Request, Response } from 'express';
import * as heapdump from 'heapdump';

export class AdminController {
    static async getHeap(req: Request, res: Response):Promise<void>{
        const filename = `/tmp/heapdump-${Date.now()}.heapsnapshot`;
        heapdump.writeSnapshot(filename, (err, filename) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to generate heap snapshot' });
          }
          res.json({ message: 'Heap snapshot written to', filename });
        });

    }
}