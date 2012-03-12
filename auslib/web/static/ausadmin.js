function handleError(response, code, error) {
    alert(response.responseText);
}

function getPermissionUrl(username, permission) {
    return SCRIPT_ROOT + '/users/' + username + '/permissions/' + permission;
}

function getRuleUrl(rule_id) {
    return SCRIPT_ROOT + '/rules/' + rule_id;
}

function addNewPermission(username, permission, options, element) {
    url = getPermissionUrl(username, permission);
    data = {
        'options': options
    };
    $.ajax(url, {'type': 'put', 'data': data})
    .error(handleError
    ).success(function(data) {
        $.get(url, {'format': 'html'})
        .error(handleError
        ).success(function(data) {
            element.append(data);
        });
    });
}

function updatePermission(username, permission, options, data_version) {
    url = getPermissionUrl(username, permission);
    data = {
        'options': options,
        'data_version': data_version
    };
    return $.ajax(url, {'type': 'post', 'data': data})
    .error(handleError
    );
}

function deletePermission(username, permission, data_version) {
    url = getPermissionUrl(username, permission);
    data = {
        'data_version': data_version
    };
    url += '?' + $.param(data);
    // Can't put the data version in the request body, because Flask
    // and many web servers/proxies don't support DELETE + request body.
    return $.ajax(url, {'type': 'delete'})
    .error(handleError
    );
}

function submitPermissionForm(username, permissionForm, element) {
    clicked = permissionForm.data('clicked');
    permission = $('[name*=permission]', permissionForm).val();
    options = $('[name*=options]', permissionForm).val();
    data_version = $('[name*=data_version]', permissionForm).val();
    if (clicked === 'update') {
        updatePermission(username, permission, options, data_version);
    }
    else if (clicked === 'delete') {
        deletePermission(username, permission, data_version)
        .success(function() {
            element.remove();
        });
    }
}

function submitThrottleForm(rule_id, throttleForm){
    url = getRuleUrl(rule_id);
    throttle = $('[name*=throttle]', throttleForm).val();
    data_version = $('[name*=data_version]', throttleForm).val();
    data = {
        'throttle': throttle,
        'data_version': data_version
    };
    return $.ajax(url,{'type': 'post', 'data': data})
        .error(handleError);
}

function submitRuleForm(ruleForm){
    rule_id = ruleForm.data('rule_id');

    url = getRuleUrl(rule_id);

    throttle = $('[name='+rule_id+'-throttle]', ruleForm).val();
    data_version = $('[name='+rule_id+'-data_version]', ruleForm).val();
    mapping = $('[name='+rule_id+'-mapping]', ruleForm).val();
    priority = $('[name='+rule_id+'-priority]', ruleForm).val();
    data = {
        'throttle': throttle,
        'mapping': mapping,
        'priority': priority,
        'data_version': data_version
    };
    return $.ajax(url,{'type': 'post', 'data': data})
        .error(handleError);
}

function redirect(page, args) {
    window.location.assign(page + '?' + $.param(args));
}
