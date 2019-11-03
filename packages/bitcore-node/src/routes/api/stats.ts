import { Request, Response } from 'express';
import { ChainStateProvider } from '../../providers/chain-state';
import { SetCache, CacheTimes } from '../middleware';
const router = require('express').Router({ mergeParams: true });

router.get('/', async function(_: Request, res: Response) {
  return res.send(404);
});

router.get('/daily-transactions', async function(req: Request, res: Response) {
  const { chain, network } = req.params;
  try {
    let dailyTxs = await ChainStateProvider.getDailyTransactions({
      chain,
      network,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    });
    SetCache(res, CacheTimes.Day);
    return res.json(dailyTxs);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/richlist', async function(req, res) {
  let { chain, network } = req.params;
  try {
    let result = await ChainStateProvider.getRichList({
      chain,
      network,
      args: req.query
    });
    return res.send(result || []);
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = {
  router: router,
  path: '/stats'
};
