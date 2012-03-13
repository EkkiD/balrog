import simplejson as json

from flask import render_template, request, Response, jsonify

from auslib.web.base import app, db
from auslib.web.views.base import requirelogin, requirepermission, AdminView
from auslib.web.views.forms import RuleForm

import logging
log = logging.getLogger(__name__)


# We should enforce one form per database row per page, so that we can keep the
# data_version consistent on the page by updating the form.

class RulesPageView(AdminView):
    """/rules.html"""
    def get(self):
        rules = db.rules.getOrderedRules()

        forms = {}

        for rule in rules:
            rule_id = rule['rule_id']
            rule_id_str = str(rule_id)
            forms[rule_id] = RuleForm(prefix=rule_id_str, throttle=rule['throttle'],  
                                    mapping=rule['mapping'], priority=rule['priority'], 
                                    data_version=rule['data_version'])
            forms[rule_id].mapping.choices = [(item['name'],item['name']) for item in 
                                                db.releases.getReleaseNames()]
        log.debug(forms)
        return render_template('rules.html', rules=rules, forms=forms)

class SingleRuleView(AdminView):

    # Changed_by is available via the requirelogin decorator
    @requirelogin
    @requirepermission(options=[])
    def _post(self, rule_id, transaction, changed_by):
        # Verify that the rule_id exists.
        if not db.rules.getRuleById(rule_id, transaction=transaction):
            return Response(status=404)
        try:
            form = RuleForm()
            what = dict(throttle=form.throttle.data,   
                        mapping=form.mapping.data)
            log.debug("SingleRuleView: POST: old_data_version: %s", form.data_version.data)
            db.rules.updateRule(changed_by, rule_id, what, old_data_version=form.data_version.data)
            return Response(status=200)
        except ValueError, e:
            return Response(status=400, response=e.args)
        except Exception, e:
            return Response(status=500, response=e.args)


app.add_url_rule('/rules.html', view_func=RulesPageView.as_view('rules.html'))
app.add_url_rule('/rules/<rule_id>', view_func=SingleRuleView.as_view('setrule'))
