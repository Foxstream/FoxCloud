describe('ComputeServiceSpec', function () {
  var service;

  beforeEach(module("FSCounterAggregatorApp"));

  beforeEach(inject(function (ComputeService) {
    service = ComputeService;
  }));

  it('service exists', function () {
    expect(service).toBeDefined();
  });

  it('create time index', function () {
    var length = 50;
    var start = moment("2015-01-02 10:00:00");
    var period = {
      startDate: start,
      endDate: start.clone().add(length, "h")
    };
    var elts = service.createTimeIndex(period,
      function (date) {
        return date.minute(0);
      },
      function (date) {
        return date.add(1, "h");
      },
      function () {
        return undefined;
      });
    expect(elts.length).toBe(length);
  });

  it('fill index', function () {
    var period = {
      startDate: moment("2010-01-01"),
      endDate: moment("2011-01-01")
    };
    var data = [
      "2010-03-10 09:00:00",
      "2010-03-10 18:30:00",
      "2010-05-01 17:00:00",
      "2010-10-10 14:00:00",
      "2010-10-10 15:00:00",
      "2010-10-10 16:00:00"
    ];
    var timeIndex = service.createTimeIndex(period,
      function (date) {
        return date.date(1);
      },
      function (date) {
        return date.add(1, "M");
      },
      function () {
        return undefined;
      });
    expect(timeIndex.length).toBe(12); // one year index
    service.fillIndex(data,
      timeIndex,
      function (elt) {
        return moment(elt).diff(period.startDate, "months");
      });
    // must have data idx 0, 1 into march period
    expect(timeIndex[2].y).toEqual([0, 1]);
    // must have data idx 2 in may period
    expect(timeIndex[4].y).toEqual([2]);
    // must have data idx 3, 4, 5 in october period
    expect(timeIndex[9].y).toEqual([3, 4, 5]);
  });
});
