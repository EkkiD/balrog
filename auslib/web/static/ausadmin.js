function handleError(response, code, error) {
    alert(response.responseText);
}

function getPermissionUrl(username, permission) {
    return SCRIPT_ROOT + '/users/' + username + '/permissions/' + permission;
}

function getRuleUrl(rule_id) {
    return SCRIPT_ROOT + '/rules/' + rule_id;
}
function getBaseRuleUrl() {
    return SCRIPT_ROOT + '/rules.html';
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
        'product': $('[name='+rule_id+'-product]', ruleForm).val(),
        'version' : $('[name='+rule_id+'-version]', ruleForm).val(),
        'build_id' : $('[name='+rule_id+'-build_id]', ruleForm).val(),
        'channel' : $('[name='+rule_id+'-channel]', ruleForm).val(),
        'locale' : $('[name='+rule_id+'-locale]', ruleForm).val(),
        'distribution' : $('[name='+rule_id+'-distribution]', ruleForm).val(),
        'build_target' : $('[name='+rule_id+'-build_target]', ruleForm).val(),
        'os_version' : $('[name='+rule_id+'-os_version]', ruleForm).val(),
        'dist_version' : $('[name='+rule_id+'-dist_version]', ruleForm).val(),
        'comment' : $('[name='+rule_id+'-comment]', ruleForm).val(),
        'update_type' : $('[name='+rule_id+'-update_type]', ruleForm).val(),
        'header_arch' : $('[name='+rule_id+'-header_arch]', ruleForm).val(),
        'data_version': data_version
    };
    return $.ajax(url,{'type': 'post', 'data': data})
        .error(handleError);
}

function redirect(page, args) {
    window.location.assign(page + '?' + $.param(args));
}

function submitNewRuleForm(ruleForm) {
    url = getBaseRuleUrl();
    data = {
        'throttle': $('[name*=new_rule-throttle]', ruleForm).val(),
        'mapping': $('[name*=new_rule-mapping]', ruleForm).val(),
        'priority': $('[name*=new_rule-priority]', ruleForm).val(),
        'product': $('[name*=new_rule-product]', ruleForm).val(),
        'version' : $('[name*=new_rule-version]', ruleForm).val(),
        'build_id' : $('[name*=new_rule-build_id]', ruleForm).val(),
        'channel' : $('[name*=new_rule-channel]', ruleForm).val(),
        'locale' : $('[name*=new_rule-locale]', ruleForm).val(),
        'distribution' : $('[name*=new_rule-distribution]', ruleForm).val(),
        'build_target' : $('[name*=new_rule-build_target]', ruleForm).val(),
        'os_version' : $('[name*=new_rule-os_version]', ruleForm).val(),
        'dist_version' : $('[name*=new_rule-dist_version]', ruleForm).val(),
        'comment' : $('[name*=new_rule-comment]', ruleForm).val(),
        'update_type' : $('[name*=new_rule-update_type]', ruleForm).val(),
        'header_arch' : $('[name*=new_rule-header_arch]', ruleForm).val()
    };
    $.ajax(url, {'type': 'post', 'data': data})
    .error(handleError
    ).success(function(data) {
        window.location = getRuleUrl(data);
    });
}

function cloneRule(ruleForm, newRuleForm, ruleId){
    $('[name*=new_rule-throttle]', newRuleForm).val($('[name='+ruleId+'-throttle]', ruleForm).val());
    $('[name*=new_rule-mapping]', newRuleForm).combobox('newVal', $('[name='+ruleId+'-mapping]', ruleForm).val());
    $('[name*=new_rule-priority]', newRuleForm).val($('[name='+ruleId+'-priority]', ruleForm).val());
    $('[name*=new_rule-product]', newRuleForm).val($('[name='+ruleId+'-product]', ruleForm).val());
    $('[name*=new_rule-version]', newRuleForm).val($('[name='+ruleId+'-version]', ruleForm).val());
    $('[name*=new_rule-build_id]', newRuleForm).val($('[name='+ruleId+'-build_id]', ruleForm).val());
    $('[name*=new_rule-channel]', newRuleForm).val($('[name='+ruleId+'-channel]', ruleForm).val());
    $('[name*=new_rule-locale]', newRuleForm).val($('[name='+ruleId+'-locale]', ruleForm).val());
    $('[name*=new_rule-distribution]', newRuleForm).val($('[name='+ruleId+'-distribution]', ruleForm).val());
    $('[name*=new_rule-build_target]', newRuleForm).val($('[name='+ruleId+'-build_target]', ruleForm).val());
    $('[name*=new_rule-os_version]', newRuleForm).val($('[name='+ruleId+'-os_version]', ruleForm).val());
    $('[name*=new_rule-dist_version]', newRuleForm).val($('[name='+ruleId+'-dist_version]', ruleForm).val());
    $('[name*=new_rule-comment]', newRuleForm).val($('[name='+ruleId+'-comment]', ruleForm).val());
    $('[name*=new_rule-update_type]', newRuleForm).val($('[name='+ruleId+'-update_type]', ruleForm).val());
    $('[name*=new_rule-header_arch]', newRuleForm).val($('[name='+ruleId+'-header_arch]', ruleForm).val());
}
