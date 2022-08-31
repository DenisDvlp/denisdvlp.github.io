//дополнительные функции даты
Date.prototype.daysInMonth = function() {
    return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
}
Date.prototype.dayOfWeek = function() {
    return (this.getDay() ? this.getDay() : 7) - 1;
}
Date.prototype.monthDayOfWeek = function() {
    var a = new Date(this.getFullYear(), this.getMonth(), 1);
    var b = a.dayOfWeek();
    return new Date(this.getFullYear(), this.getMonth(), 1).dayOfWeek();
}
Date.prototype.mmddyy = function() {
    var m = this.getMonth() + 1;
    var d = this.getDate();
    var y = this.getFullYear();
    return [(m > 9 ? '' : '0') + m, (d > 9 ? '' : '0') + d, y].join('/');
}
Date.prototype.correctDate = function() {
    return new Date(this - this.getTimezoneOffset() * 60000);
}
Date.prototype.Compare = function(date) {
    date = Value(date, new Date(0));
    var d = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    return (d - date) / 86400000;
}
Date.prototype.FromToDo = function(date, func) {
    var dif = -this.Compare(date);
    for(var i = 0; i <= dif; i++)
        func();
}

//корректное значение
function Value(initValue, defaultValue) {
    if (defaultValue === undefined) defaultValue = null;
    return initValue !== undefined ? initValue : defaultValue;
}

//класс список
function List() {
    this.items = [];
    this.Add = function(item) {
        if (item === undefined)
            return false;
        this.items.push(item);
        return true;
    }
    this.Place = function(index, item) {
        item = Value(item);
        index = Value(index, -1);
        if (index < 0 || !item)
            return false;
        this.items[index] = item;
        return true;
    }
    this.Get = function(index) {
        index = Value(index, -1);
        if (index < 0 || index >= this.Count())
            return null;
        return this.items[index];
    }
    this.Remove = function(index) {
        index = Value(index, -1);
        if (index < 0 || index >= this.Count())
            return false;
        this.items.splice(index, 1);
        return true;
    }
    this.Clear = function() {
        this.items.length = 0;
    }
    this.Count = function() {
        return this.items.length;
    }
    this.Sort = function(func) {
        this.items.sort(func);
    }
}

//класс событие
function Event(props) {
    props = Value(props, {});
    this.position = Value(props.position, 0);
    this.dateStart = Value(props.dateStart, new Date(0));
    this.dateEnd = Value(props.dateEnd, this.dateStart);
    this.name = Value(props.name, "");
    this.description = Value(props.description, "");
}

//класс база данных
function DB() {
    List.call(this);
    var loaded = false;

    function SaveDB() {
        localStorage.setItem("db", JSON.stringify(items));
    }

    function LoadDB() {
        if (loaded) return;
        loaded = true;
        var str = localStorage.getItem("db");
        if (str === undefined) return;
        items = JSON.parse(str);
        if (items === null)
            items = [];
        for (var index in items) {
            items[index].dateStart = new Date(items[index].dateStart);
            items[index].dateEnd = new Date(items[index].dateEnd);
        }
    }
    var parentAdd = this.Add;
    this.Add = function(event) {
        LoadDB();
        if (parentAdd.apply(this, arguments))
            SaveDB();
    }
    var parentGet = this.Get;
    this.Get = function(index) {
        LoadDB();
        return parentGet.apply(this, arguments);
    }
    var parentRemove = this.Remove;
    this.Remove = function(index) {
        LoadDB();
        if (parentRemove.apply(this, arguments))
            SaveDB();
    }
    var parentClear = this.Clear;
    this.Clear = function() {
        if (parentClear.call(this))
            SaveDB();
    }
    this.Show = function() {
        LoadDB();
        for (var i = 0; i < items.length; i++)
            console.log(items[i]);
    }
}

//класс день
function Day() {
    var d; //дата этого дня
    var curd; //текущая дата (месяца)
    var obj; //объект для рисования
    var bkclass = ''; //цвет заднего фона

    this.date = d;
    this.events = new List();

    this.Init = function(date, curDate, object) {
        d = Value(date);
        this.date = d;
        curd = Value(curDate);
        obj = Value(object);
    }

    this.Draw = function() {
        if (!d || !curd || !obj) return;
        var day = $(obj);
        //очистка дня
        day.html('');
        day.removeClass(bkclass);
        //рисование дня
        var divNumber = $('<div class="number">');
        divNumber.removeClass('withevent');
        divNumber.text(d.getDate());
        day.append(divNumber);
        if (curd.getMonth() != d.getMonth() || curd.getFullYear() != d.getFullYear())
            bkclass = 'notthismonth';
        else
        if (curd.getDate() == d.getDate())
            bkclass = 'today';
        else
            bkclass = 'thismonth';
        day.addClass(bkclass);
        //рисование событий
        if(this.events.Count())
            divNumber.addClass('withevent');
        for(var i = 0; i < this.events.Count() && i < 3; i++){
            var e = this.events.Get(i);
            if(!e) continue;
            var before = e.dateStart.Compare(d);
            var after = e.dateEnd.Compare(d);
            if(before > 0 || after < 0) break;
            var divEvent = $('<div class="event pos' + (i + 1) + '">');
            divEvent.text(e.name);
            if(before == 0)
                divEvent.addClass('begin');
            if(after == 0)
                divEvent.addClass('end');
            day.append(divEvent);
       }
    }
}

//класс календарь
function Calendar() {
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    var weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    var mainDiv = $('div.calendar');
    var days = new List();
    var db;
    var d;

    Init();

    function Init() {
        for (var i = 0; i < 6; i++)
        for (var i = 0; i < 42; i++)
            days.Add(new Day());
    }

    this.Init = function(database, date) {
        db = Value(database);
        d = Value(date);
    }

    this.AddEvent = function(event) {
        //добавляем событие
        db.Add(event);
        //сортируем по дате начала события
        db.Sort(function(a, b){
            return a.dateStart - b.dateStart; 
        });
        //чистим все события в днях
        for (var i = 0; i < 42; i++)
            days.Get(i).events.Clear();
        //пробегаем по всем событиям
        for (var i = 0; i < db.Count(); i++) {
            var event = db.Get(i);
            //находим день, с которого начинается событие
            for (var j = 0; j < 42; j++){
                var day = days.Get(j);
                if(!day.date.Compare(event.dateStart)){
                    //получаем свободную позицию события в стартовом дне
                    var index = day.events.Count();
                    for(var k = 0; k < day.events.Count(); k++)
                        if(!day.events.Get(k)){
                            index = k;
                            break;
                        }
                    //начиная с текущего дня и до окончания события
                    event.dateStart.FromToDo(event.dateEnd, function(){
                        //вставляем событие в нужную позицию
                        var day = days.Get(j++);
                        day.events.Place(index, event);
                    });
                    break;
                }
            }
        }
    }

    this.Draw = function() {
        //месяц
        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        $('div.month').text(monthNames[d.getMonth()]);
        //дни
        var currentDay = 1 - d.monthDayOfWeek();
        $('div.day').each(function(i, divDay) {
            var dt = new Date(
                d.getFullYear(),
                d.getMonth(),
                currentDay++);
            var day = days.Get(i);
            day.Init(dt, d, divDay);
            day.Draw();
        });
    }
}

//показ диалога добавления
function ShowAddDialog(event) {
    $("div.adddialog input[name=name]").val(event.name);
    $("div.adddialog input[name=description]").val(event.description);
    var ss = event.dateStart.mmddyy();
    var es = event.dateEnd.mmddyy();
    var sm = event.dateStart.getTime();
    var em = event.dateEnd.getTime();
    $("div.adddialog input[name=startdate]").val(sm ? ss : '');
    $("div.adddialog input[name=enddate]").val(em ? es : '');
    $("div.adddialog").show();
    $("div.addbtn").css('background-color', '#4CAF50').hide();
    setTimeout(function() {
        $("div.adddialog").addClass('zoomout');
        $("div.adddialog form").addClass('zoomout');
    }, 50);
}

//добавление события в календарь
function CalendarAddEvent(event) {

    if (!event) event = new Event();

    var date = event.dateStart;
    var today = new Date();
    if (today.getFullYear() != date.getFullYear()) return;

    var prevMonthDays = daysInMonth(new Date(today.getFullYear(), today.getMonth() - 1));
    var monthDays = daysInMonth(today);
    var offset = monthDayOfWeek(today.getFullYear(), today.getMonth());
    var nums = $('div.day .number');

    var d = date.getDate();
    var m = date.getMonth();
    var index = -1;
    if (today.getMonth() == m)
        index = date.getDate() + offset - 1;
    else
    if (today.getMonth() == m - 1)
        index = monthDays + date.getDate() + offset - 1;
    else
    if (today.getMonth() == m + 1)
        index = prevMonthDays - date.getDate() + offset - 1;
    $(nums[index]).parent().append($('<div class="event">').text(event.name));
}

//проверка полей
function CheckFields() {
    return ($("div.adddialog input[name=name]").val()) &&
        ($("div.adddialog input[name=startdate]").val()) &&
        ($("div.adddialog input[name=enddate]").val());
}

//обработка кнопок и клавиш
$(function() {

    //обработка клавиш
    $(document).keyup(function(e) {
        //ESC
        if (e.keyCode == 27 && $("div.adddialog").is(':visible')) {
            $("div.adddialog").click();
        }
    });

    //обработка кнопки Add Event на диалоге добавления
    $("div.adddialog").click(function() {
        $("div.adddialog").removeClass('zoomout');
        $("div.adddialog form").removeClass('zoomout');
        setTimeout(function() {
            $("div.adddialog").hide();
            $("div.addbtn").css('background-color', '#4CAF50').show();
        }, 200);
    }).children().click(function() {
        return false;
    });

    //обработка кнопки +
    $("div.addbtn").click(function() {
        ShowAddDialog(new Event({ dateStart: new Date() }));
    });

    //обработка дней календаря
    $('div[class=day]').click(function() {
        var t = $(this).find("div.number").text();
        ShowAddDialog(new Event({
            name: $(this).find("div.event").text(),
            dateStart: new Date('04/' + (t > '9' ? '' : '0') + t + '/2017')
        }));
    });

    $("div.adddialog input[name=add]").click(function() {
        if (CheckFields()) {
            $("div.adddialog").click();
            var tmOffset = new Date().getTimezoneOffset() * 60000;
            var sDate = new Date(new Date($("div.adddialog input[name=startdate]").val()) - tmOffset);
            var eDate = new Date(new Date($("div.adddialog input[name=enddate]").val()) - tmOffset);
            var event = new Event({
                name: $("div.adddialog input[name=name]").val(),
                description: $("div.adddialog input[name=description]").val(),
                dateStart: sDate,
                dateEnd: eDate
            });
            db.Add(event);
            CalendarAddEvent(event);
        }
        $(this).css('background-color', '#4CAF50');
    });

    //обработка кнопок для эффекта нажатой кнопки
    $("div.addbtn, div.adddialog input[name=add]").mousedown(function() {
        $(this).css('background-color', '#FFC400');
    });

});

//datepicker
$(function() {
    var dateFormat = "mm/dd/yy";

    from = $("#startdate").datepicker({
        dateFormat: "mm/dd/yy",
        defaultDate: "+1w",
        changeMonth: true,
        numberOfMonths: 1
    }).on("change", function() {
        to.datepicker("option", "minDate", getDate(this));
    });

    to = $("#enddate").datepicker({
        dateFormat: "mm/dd/yy",
        defaultDate: "+1w",
        changeMonth: true,
        numberOfMonths: 1
    }).on("change", function() {
        from.datepicker("option", "maxDate", getDate(this));
    });

    function getDate(element) {
        var date;
        try {
            date = $.datepicker.parseDate(dateFormat, element.value);
        } catch (error) {
            date = null;
        }
        return date;
    }
});

//запуск
$(function() {

    //создание календаря
    var calendar = new Calendar();
    //создание базы
    var db = new DB();
    db.Show();
    //получение даты
    var today = new Date();
    //связка календаря с базой и датой
    calendar.Init(db, today);
    //отрисовка календаря
    calendar.Draw();

    //добавление события и автоматическая отрисовка
    calendar.AddEvent(
        new Event({
            name: "1",
            description: "description",
            dateStart: new Date(2017, 3, 4),
            dateEnd: new Date(2017, 3, 8)
        }));
    calendar.AddEvent(
        new Event({
            name: "2",
            description: "description",
            dateStart: new Date(2017, 3, 6),
            dateEnd: new Date(2017, 3, 12)
        }));
    calendar.AddEvent(
        new Event({
            name: "3",
            description: "description",
            dateStart: new Date(2017, 3, 9),
            dateEnd: new Date(2017, 3, 11)
        }));
    calendar.AddEvent(
        new Event({
            name: "4",
            description: "description",
            dateStart: new Date(2017, 3, 12),
        }));
    calendar.Draw();
});