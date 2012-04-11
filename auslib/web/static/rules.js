// These two functions use the example code from DataTables found here:
// http://datatables.net/examples/plug-ins/dom_sort.html
//
/* Create an array with the values of all the input boxes in a column */
$.fn.dataTableExt.afnSortData['dom-text'] = function  ( oSettings, iColumn )
{
        var aData = [];
            $( 'td:eq('+iColumn+') input', oSettings.oApi._fnGetTrNodes(oSettings) ).each( function () {
                        aData.push( this.value );
                            } );
                return aData;
};

/* Create an array with the values of all the select options in a column */
$.fn.dataTableExt.afnSortData['dom-select'] = function  ( oSettings, iColumn )
{
        var aData = [];
            $( 'td:eq('+iColumn+') select', oSettings.oApi._fnGetTrNodes(oSettings) ).each( function () {
                        aData.push( $(this).val() );
                            } );
                return aData;
};

$(document).ready(function() {
        $('#rules_table').dataTable({
            "aoColumnDefs": [
                { "sSortDataType": "dom-select", "aTargets":[0] },
                { "sSortDataType": "dom-text", "aTargets":[1, 2] },
                { "sType": "numeric", "aTargets": [1, 2] }
            ],
            "fnDrawCallback": function(){
                console.log("OnDraw");
                $("select","[id*=mapping]").combobox();
            }
            });

        $( "#toggle" ).click(function() {
            $( "select","[id*=mapping]").toggle();
        });
} );



// This is a modified version of the jquery-ui combobox example:
// http://jqueryui.com/demos/autocomplete/#combobox
//
(function( $ ) {
    $.widget( "ui.combobox", {
        _create: function() {
            var self = this,
            select = this.element.hide(),
            selected = select.children( ":selected" ),
            value = selected.val() ? selected.text() : "";
            var input = this.input = $( "<input>" ).insertAfter( select ).val( value ) .autocomplete({
                    delay: 0,
                    minLength: 0,
                    source: function( request, response ) {
                        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
                        response( select.children( "option" ).map(function() {
                            var text = $( this ).text();
                            if ( this.value && ( !request.term || matcher.test(text) ) )
                            {
                                return {
                                    label: text.replace(
                                               new RegExp(
                                                   "(?![^&;]+;)(?!<[^<>]*)(" +
                                                   $.ui.autocomplete.escapeRegex(request.term) +
                                                   ")(?![^<>]*>)(?![^&;]+;)", "gi"
                                                   ), "<strong>$1</strong>" ),
                                        value: text,
                                option: this
                                };
                            }
                        }) );
                    },
                    select: function( event, ui ) {
                        ui.item.option.selected = true;
                        self._trigger( "selected", event, {
                            item: ui.item.option
                        });
                    },
                    change: function( event, ui ) {
                        if ( !ui.item ) {
                            var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( $(this).val() ) + "$", "i" ),
                                valid = false;
                            select.children( "option" ).each(function() {
                                if ( $( this ).text().match( matcher ) ) {
                                    this.selected = valid = true;
                                    return false;
                                }
                            });
                            if ( !valid ) {
                                // remove invalid value, as it didn't match anything
                                $( this ).val( "" );
                                select.val( "" );
                                input.data( "autocomplete" ).term = "";
                                return false;
                            }
                        }
                    }
                })
                .addClass( "ui-widget ui-widget-content ui-corner-left" );

            input.data( "autocomplete" )._renderItem = function( ul, item ) {
                return $( "<li></li>" )
                    .data( "item.autocomplete", item )
                    .append( "<a>" + item.label + "</a>" )
                    .appendTo( ul );
            };

            this.button = $( "<button type='button'>&nbsp;</button>" )
                .attr( "tabIndex", -1 )
                .attr( "title", "Show All Items" )
                .insertAfter( input )
                .button({
                    icons: {
                        primary: "ui-icon-triangle-1-s"
                    },
                    text: false
                })
                .removeClass( "ui-corner-all" )
                    .addClass( "ui-corner-right ui-button-icon" )

                    .click(function() {
                        // close if already visible
                        if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
                            input.autocomplete( "close" );
                            return;
                        }

                        // work around a bug (likely same cause as #5265)
                        $( this ).blur();

                        // pass empty string as value to search for, displaying all results
                        input.autocomplete( "search", "" );
                        input.focus();
                    });
        },

            destroy: function() {
                this.input.remove();
                this.button.remove();
                this.element.show();
                $.Widget.prototype.destroy.call( this );
            },
            // Change the value of the combobox:
            // To do this we need to change both the select box and the input
            newVal: function(value) {
                this.element.val(value);
                this.input.val(value);
            }
    });
}( jQuery ));

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
        'data_version': data_version,
        'csrf': $('[name='+rule_id+'-csrf]', ruleForm).val()
    };
    return $.ajax(url,{'type': 'post', 'data': data})
        .error(handleError);
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
        'header_arch' : $('[name*=new_rule-header_arch]', ruleForm).val(),
        'csrf' : $('[name*=new_rule-csrf]', ruleForm).val()
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
