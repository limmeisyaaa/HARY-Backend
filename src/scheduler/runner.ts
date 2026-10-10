import cron, { TaskFn } from 'node-cron';
import { nonActiveCouponJob } from './jobs/coupon.job';
import { nonActivePointJob } from './jobs/point.reward.job';

const cronRunner = () => {
    //Call the function to run the cron job
    nonActiveCouponJob();
    nonActivePointJob();
}

export default cronRunner;

export const createScheduler = (expr: string, task: string | TaskFn) => {
    cron.schedule(expr, task);
}