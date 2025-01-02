export class DateHelper {
    static getWeekNumber(cohortStartDate: Date, currentDate: Date): number {
      const diffTime = Math.abs(currentDate.getTime() - cohortStartDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.ceil(diffDays / 7);
    }
  
    static isValidSubmissionWindow(
      weekNumber: number,
      cohortStartDate: Date,
      currentDate: Date
    ): boolean {
      const currentWeek = this.getWeekNumber(cohortStartDate, currentDate);
      
      // Can submit for current week and previous week (1 week late submission window)
      return weekNumber === currentWeek || weekNumber === currentWeek - 1;
    }
  }