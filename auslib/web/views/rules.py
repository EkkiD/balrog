import simplejson as json

from flask import render_template, request, Response, jsonify

from auslib.web.base import app, db
from auslib.web.views.base import requirelogin, requirepermission, AdminView
from auslib.web.views.forms import RuleForm, NewRuleForm

import logging
log = logging.getLogger(__name__)

class RulesPageView(AdminView):
    """/rules.html"""
    # changed_by is available via the requirelogin decorator
    @requirelogin
    @requirepermission(options=[])
    def _post(self, transaction, changed_by):
        log.debug("RuleView: POST" )
        # a Post here creates a new rule
        try:
            form = NewRuleForm()
            what = dict(throttle=form.throttle.data,   
                        mapping=form.mapping.data,
                        priority=form.priority.data,
                        product = form.product.data,
                        version = form.version.data,
                        build_id = form.build_id.data,
                        channel = form.channel.data,
                        locale = form.locale.data,
                        distribution = form.distribution.data,
                        build_target = form.build_target.data,
                        os_version = form.os_version.data,
                        dist_version = form.dist_version.data,
                        comment = form.comment.data,
                        update_type = form.update_type.data,
                        header_arch = form.header_arch.data)
            rule_id = db.rules.insertRule(changed_by, what, transaction=transaction)
            return Response(status=200, response=rule_id)
        except ValueError, e:
            return Response(status=400, response=e.args)
        except Exception, e:
            return Response(status=500, response=e.args)

    def get(self):
        rules = db.rules.getOrderedRules()

        new_rule_form = NewRuleForm(prefix="new_rule");
        new_rule_form.mapping.choices = [(item['name'],item['name']) for item in 
                                                db.releases.getReleaseNames()]
        forms = {}

        for rule in rules:
            _id = rule['rule_id']
            forms[_id] = RuleForm(prefix=str(_id), throttle=rule['throttle'],  
                                    mapping=rule['mapping'], priority=rule['priority'], 
                                    data_version=rule['data_version'])
            forms[_id].mapping.choices = [(item['name'],item['name']) for item in 
                                                db.releases.getReleaseNames()]
        return render_template('rules.html', rules=rules, forms=forms, new_rule_form=new_rule_form)

class SingleRuleView(AdminView):
    """ /rules/<rule_id> """

    def get(self, rule_id):
        rule = db.rules.getRuleById(rule_id);
        return render_template('single_rule.html', rule=rule)

    # changed_by is available via the requirelogin decorator
    @requirelogin
    @requirepermission(options=[])
    def _post(self, rule_id, transaction, changed_by):
        # Verify that the rule_id exists.
        if not db.rules.getRuleById(rule_id, transaction=transaction):
            return Response(status=404)
        try:
            form = RuleForm()
            what = dict(throttle=form.throttle.data,   
                        mapping=form.mapping.data,
                        priority=form.priority.data)
            log.debug("SingleRuleView: POST: old_data_version: %s", form.data_version.data)
            db.rules.updateRule(changed_by, rule_id, what, old_data_version=form.data_version.data, transaction=transaction)
            return Response(status=200)
        except ValueError, e:
            return Response(status=400, response=e.args)
        except Exception, e:
            return Response(status=500, response=e.args)


app.add_url_rule('/rules.html', view_func=RulesPageView.as_view('rules.html'))
app.add_url_rule('/rules/<rule_id>', view_func=SingleRuleView.as_view('setrule'))
