declare module "julian" {
    /**
     *
     * @param {Date} date
     * @returns {number}
     */
    export function fromDate(date: Date): number;
    /**
     *
     * @param {number} julian
     * @returns {Date}
     */
    export function toDate(julian: number): Date;
}
declare module "lune" {
    export type Phase = {
        phase: number;
        illuminated: number;
        age: number;
        distance: number;
        angular_diameter: number;
        sun_distance: number;
        sun_angular_diameter: number;
    };
    export type PhaseHunt = {
        new_date: Date;
        q1_date: Date;
        full_date: Date;
        q3_date: Date;
        nextnew_date: Date;
    };
    const NEW: 0;
    const FIRST: 1;
    const FULL: 2;
    const LAST: 3;
    /**
     * @typedef {Object} Phase
     * @property {number} phase
     * @property {number} illuminated
     * @property {number} age
     * @property {number} distance
     * @property {number} angular_diameter
     * @property {number} sun_distance
     * @property {number} sun_angular_diameter
     */
    /**
     * Finds the phase information for specific date.
     * @param  {Date}   date Date to get phase information of.
     * @return {Phase}      Phase data
     */
    export function phase(date: Date): Phase;
    /**
     * @typedef {Object} PhaseHunt
     * @property {Date} new_date
     * @property {Date} q1_date
     * @property {Date} full_date
     * @property {Date} q3_date
     * @property {Date} nextnew_date
     */
    /**
     * Find time of phases of the moon which surround the current date.
     * Five phases are found, starting and ending with the new moons
     * which bound the current lunation.
     * @param  {Date} sdate Date to start hunting from (defaults to current date)
     * @return {PhaseHunt}     Object containing recent past and future phases
     */
    function phaseHunt(sdate: Date): PhaseHunt;
    /**
     *
     * @param {Date} start
     * @param {Date} end
     * @param {number} phase
     * @returns {Date[]}
     */
    function phaseRange(start: Date, end: Date, phase: number): Date[];
    export { NEW as PHASE_NEW, FIRST as PHASE_FIRST, FULL as PHASE_FULL, LAST as PHASE_LAST, phaseHunt as phase_hunt, phaseRange as phase_range };
}
