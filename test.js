$(function () {

    function not(x)         { return !x; }
    function always(x)      { return function () { return x; } }
    function id(x)          { return x; }
    function apply(x, f)    { return f(x); }
    function uncurry(f)     { return function (x) { return f(x); } }

    var clearDone = $('#clearDone').asEventStream('click');
    var selectAll = $('#selectAll').asEventStream('click').scan(false, not).changes();
    var todos     = $('#newTodo').asEventStream('click')
        .map(function () { return todoTemplate(clearDone, selectAll); });

    function todoTemplate(clearDone, selectAll) {

        var input  = $('<input class="todoInput" type="text"/>')
        var remove = $('<button class="removeTodo"> Remove </button>');
        var done   = $('<button class="removeTodo"> Done </button>');
        var todo   = $('<div class="todoItem"/>')

        todo.append(input).append(remove).append(done);
        $('#todos').append(todo);

        var values  = input.asEventStream('change').map('.target.value');
        var remove  = remove.asEventStream('click');
        var dones   = done.asEventStream('click').map(always(not));
        var selects = selectAll.map(uncurry(always))

        var done  = dones.merge(selects).scan(false, apply);
        var clear = done.sampledBy(clearDone).filter(id).merge(remove).take(1);

        return {
            view: todo,
            out: values.takeUntil(clear),
            done: done.takeUntil(clear),
        };
    }

    todos.onValue(function (todo) {
        todo.out.onValue(function (x) {
            console.log(x)
        })
        todo.out.onEnd(function () {
            $(todo.view).detach();
        });
        todo.done.onValue(function (x) {
            $(todo.view.find('input')).toggleClass('done', x).attr('readOnly', x);
        });
    });

});
