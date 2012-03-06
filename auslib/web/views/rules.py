import simplejson as json

from flask import render_template, request, Response, jsonify

from auslib.web.base import app, db
from auslib.web.views.base import requirelogin, requirepermission, AdminView
from auslib.web.views.forms import NewPermissionForm, ExistingPermissionForm

import logging
log = logging.getLogger(__name__)

class RulesPageView(AdminView):
    """/rules.html"""
    def get(self):
        rules = db.rules.getOrderedRules()
        return render_template('rules.html', rules=rules)

app.add_url_rule('/rules.html', view_func=RulesPageView.as_view('rules.html'))
