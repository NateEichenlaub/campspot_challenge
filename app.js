var fs = require('fs');
var moment = require('moment');
var _ = require('lodash');

var data = datesToMoments(loadData('./test-case.json'));
var sites = availableSites(data.search, data.campsites, data.gapRules, data.reservations);
sites.forEach(s => console.log(s.name));

//returns array of available campsites
function availableSites(search, campsites, gapRules, reservations) {
    return campsites.filter(site => {
        var siteReservations = reservations.filter(r => r.campsiteId === site.id);
        var adjacent = adjacentReservations(search, siteReservations);
        var prev_gap = gap(search, adjacent.prev);
        var next_gap = gap(search, adjacent.next);
        var gapSizes = gapRules.map(r => r.gapSize);

        //if prev and next gaps are not in gap rules list, and search does not overlap with existing reservations
        return !_.includes(gapSizes, prev_gap) && !_.includes(gapSizes, next_gap) && prev_gap != -1 && next_gap != -1;
    });
}

//calculate gap between two date ranges. return -1 if ranges overlap
function gap(range1, range2) {
    if(!range1 || !range2) {
        return null;
    }else if (range1.startDate > range2.endDate) {
        return range1.startDate.diff(range2.endDate, 'days') - 1;
    }
    else if (range2.startDate > range1.endDate) {
        return range2.startDate.diff(range1.endDate, 'days') - 1;
    }
    else {
        return -1;
    }
}

//find last reservation with startDate before or on search startDate and first reservation with startDate after search startDate
function adjacentReservations(search, reservations) {
    _.sortBy(reservations, 'startDate');
    return {
        prev: _.findLast(reservations, r => r.startDate <= search.startDate),
        next: _.find(reservations, r => r.startDate > search.startDate)
    }
}

//convert date strings to moment objects
function datesToMoments(data) {
    var formatString = 'YYYY-MM-DD';
    data.search.startDate = moment(data.search.startDate, formatString);
    data.search.endDate = moment(data.search.endDate, formatString);

    data.reservations.map(r => {
        r.startDate = moment(r.startDate, formatString);
        r.endDate = moment(r.endDate, formatString);
        return r;
    });

    return data;
}

//load JSON file and parse
function loadData(file) {
    return JSON.parse(fs.readFileSync(file));
}

//exports for test
exports.loadData = loadData;
exports.datesToMoments = datesToMoments;
exports.adjacentReservations = adjacentReservations;
exports.gap = gap;
exports.availableSites = availableSites;