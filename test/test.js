var assert = require('chai').assert;
var moment = require('moment');
var _ = require('lodash');
var app = require('../app.js');

describe('Campspot Programming Challenge', function() {
    describe('loadData()', function() {
        it("should import JSON file as Object", function() {
            var filePath = './test-case.json';
            var data = app.loadData(filePath);
            assert.isObject(data);
        });

        it("should have properties: 'search', 'campsites', 'gapRules', 'reservations'", function() {
            var filePath = './test-case.json';
            var data = app.loadData(filePath);
            assert.property(data, 'search');
            assert.property(data, 'campsites');
            assert.property(data, 'gapRules');
            assert.property(data, 'reservations');
        });
    })

    describe('datesToMoments()', function() {
        it("should convert 'startDate' and 'endDate' properties of 'search' to moment objects", function() {
            var testObj = {
                search: {
                    startDate: '2017-01-01',
                    endDate: '2017-01-02'
                },
                reservations: [
                    {
                        startDate: '2017-01-01',
                        endDate: '2017-01-02'
                    },
                    {
                        startDate: '2017-01-01',
                        endDate: '2017-01-02'
                    }
                ]
            };
            app.datesToMoments(testObj);

            assert(moment.isMoment(testObj.search.startDate));
            assert(moment.isMoment(testObj.search.endDate));
        })
        it("should convert 'startDate' and 'endDate' properties of all objects in 'reservations' array to moment objects", function() {
            var testObj = {
                search: {
                    startDate: '2017-01-01',
                    endDate: '2017-01-02'
                },
                reservations: [
                    {
                        startDate: '2017-01-01',
                        endDate: '2017-01-02'
                    },
                    {
                        startDate: '2017-01-01',
                        endDate: '2017-01-02'
                    }
                ]
            };
            app.datesToMoments(testObj);

            assert(moment.isMoment(testObj.reservations[0].startDate));
            assert(moment.isMoment(testObj.reservations[0].endDate));
            assert(moment.isMoment(testObj.reservations[1].startDate));
            assert(moment.isMoment(testObj.reservations[1].endDate));
        })
    })

    describe('adjacentReservations()', function() {
        it('should return last reservation with start date before or on search start date and first reservation with start date after search start date', function() {
            var reservations = [
                {
                    startDate: moment('2017-01-01'),
                    endDate: moment('2017-01-02')
                },
                {
                    startDate: moment('2017-01-03'),
                    endDate: moment('2017-01-05')
                },
                {
                    startDate: moment('2017-01-10'),
                    endDate: moment('2017-01-20')
                }
                ,
                {
                    startDate: moment('2017-02-01'),
                    endDate: moment('2017-02-10')
                }
            ];

            var search = {
                startDate: moment('2017-01-06'),
                endDate: moment('2017-01-08')
            };

            var adjacent = app.adjacentReservations(search, reservations);
            assert(adjacent.prev == reservations[1]);
            assert(adjacent.next == reservations[2]);
        });

        it('should work when reservations array is not ordered', function() {
            var reservations = [
                {
                    startDate: moment('2017-01-01'),
                    endDate: moment('2017-01-02')
                },
                {
                    startDate: moment('2017-01-10'),
                    endDate: moment('2017-01-20')
                },
                {
                    startDate: moment('2017-02-01'),
                    endDate: moment('2017-02-10')
                },
                {
                    startDate: moment('2017-01-03'),
                    endDate: moment('2017-01-05')
                }
            ];

            var search = {
                startDate: moment('2017-01-06'),
                endDate: moment('2017-01-08')
            };

            var adjacent = app.adjacentReservations(search, reservations);
            assert(adjacent.prev == reservations[3]);
            assert(adjacent.next == reservations[1]);
        });

        it('should return nothing for prev and/or next if no reservation matches criteria', function() {
            var reservations = [
                {
                    startDate: moment('2017-01-01'),
                    endDate: moment('2017-01-02')
                },
                {
                    startDate: moment('2017-01-03'),
                    endDate: moment('2017-01-05')
                }
            ];

            var search = {
                startDate: moment('2017-01-06'),
                endDate: moment('2017-01-08')
            };

            var adjacent = app.adjacentReservations(search, reservations);
            assert(!adjacent.next)
        });
    })

    describe('gap()', function() {
        it('should return the gap in days between the two date ranges if they do not overlap', function() {
            var range1 = {
                startDate: moment('2017-01-01'),
                endDate: moment('2017-01-03')
            }
            var range2 = {
                startDate: moment('2017-01-06'),
                endDate: moment('2017-02-01')
            }

            assert.equal(2, app.gap(range1, range2));
        });

        it('should work when date ranges are in any order', function() {
            var range2 = {
                startDate: moment('2017-01-01'),
                endDate: moment('2017-01-03')
            }
            var range1 = {
                startDate: moment('2017-01-06'),
                endDate: moment('2017-02-01')
            }

            assert.equal(2, app.gap(range1, range2));
        });

        it('should return -1 if date ranges overlap completely', function() {
            var range2 = {
                startDate: moment('2017-01-01'),
                endDate: moment('2017-02-01')
            }
            var range1 = {
                startDate: moment('2017-01-06'),
                endDate: moment('2017-01-10')
            }

            assert.equal(-1, app.gap(range1, range2));
        });

        it('should return -1 if date ranges overlap partially', function() {
            var range2 = {
                startDate: moment('2017-01-01'),
                endDate: moment('2017-01-10')
            }
            var range1 = {
                startDate: moment('2017-01-06'),
                endDate: moment('2017-01-20')
            }

            assert.equal(-1, app.gap(range1, range2));
        });

        it('should return null if either date range is null', function() {
            var range1 = {
                startDate: moment('2017-01-01'),
                endDate: moment('2017-01-10')
            }

            assert.isNull(app.gap(range1, null));
        });
    })

    describe('availableSites()', function() {
        it("should return an array of campsites that are available to book", function() {
            var test_case =
            {
                "search": {
                    "startDate": "2016-06-07",
                    "endDate": "2016-06-10"
                },
                "campsites": [
                    {
                        "id": 1,
                        "name": "Grizzly Adams Adventure Cabin"
                    },
                    {
                        "id": 2,
                        "name": "Lewis and Clark Camp Spot"
                    },
                    {
                        "id": 3,
                        "name": "Jonny Appleseed Log Cabin"
                    },
                    {
                        "id": 4,
                        "name": "Davey Crockett Camphouse"
                    },
                    {
                        "id": 5,
                        "name": "Daniel Boone Bungalow"
                    },
                    {
                        "id": 6,
                        "name": "Teddy Rosevelt Tent Site"
                    },
                    {
                        "id": 7,
                        "name": "Edmund Hillary Igloo"
                    },
                    {
                        "id": 8,
                        "name": "Bear Grylls Cozy Cave"
                    },
                    {
                        "id": 9,
                        "name": "Wyatt Earp Corral"
                    }
                ],
                "gapRules": [
                    {
                        "gapSize": 2
                    },
                    {
                        "gapSize": 3
                    }
                ],
                "reservations": [
                    {"campsiteId": 1, "startDate": "2016-06-01", "endDate": "2016-06-04"},
                    {"campsiteId": 1, "startDate": "2016-06-11", "endDate": "2016-06-13"},
                    {"campsiteId": 2, "startDate": "2016-06-08", "endDate": "2016-06-09"},
                    {"campsiteId": 3, "startDate": "2016-06-04", "endDate": "2016-06-06"},
                    {"campsiteId": 3, "startDate": "2016-06-14", "endDate": "2016-06-16"},
                    {"campsiteId": 4, "startDate": "2016-06-03", "endDate": "2016-06-05"},
                    {"campsiteId": 4, "startDate": "2016-06-13", "endDate": "2016-06-14"},
                    {"campsiteId": 5, "startDate": "2016-06-03", "endDate": "2016-06-06"},
                    {"campsiteId": 5, "startDate": "2016-06-12", "endDate": "2016-06-14"},
                    {"campsiteId": 6, "startDate": "2016-06-04", "endDate": "2016-06-06"},
                    {"campsiteId": 6, "startDate": "2016-06-11", "endDate": "2016-06-12"},
                    {"campsiteId": 6, "startDate": "2016-06-16", "endDate": "2016-06-16"},
                    {"campsiteId": 7, "startDate": "2016-06-03", "endDate": "2016-06-04"},
                    {"campsiteId": 7, "startDate": "2016-06-07", "endDate": "2016-06-09"},
                    {"campsiteId": 7, "startDate": "2016-06-13", "endDate": "2016-06-16"},
                    {"campsiteId": 8, "startDate": "2016-06-01", "endDate": "2016-06-02"},
                    {"campsiteId": 8, "startDate": "2016-06-05", "endDate": "2016-06-06"},
                    {"campsiteId": 9, "startDate": "2016-06-03", "endDate": "2016-06-05"},
                    {"campsiteId": 9, "startDate": "2016-06-12", "endDate": "2016-06-16"}
                ]
            }

            data = app.datesToMoments(test_case);
            var sites = app.availableSites(data.search, data.campsites, data.gapRules, data.reservations);
            assert(_.isEqual([5,6,8,9], sites.map(s => s.id)));
        })
    })
});