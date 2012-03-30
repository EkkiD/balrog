import simplejson as json

from auslib.web.base import db
from auslib.test.web.views.base import ViewTest, JSONTestMixin, HTMLTestMixin

class TestRulesAPI_JSON(ViewTest, HTMLTestMixin):
    def testGetRules(self):
        ret = self._get('/rules.html')
        self.assertEquals(ret.status_code, 200)
        self.assertTrue("<form id='rules_form'" in ret.data, msg=ret.data)
        self.assertTrue('<input id="1-throttle" name="1-throttle" type="text" value="100" />' in ret.data, msg=ret.data)
        self.assertTrue('<input id="1-priority" name="1-priority" type="text" value="100" />' in ret.data, msg=ret.data)

    def testPost(self):
        # Make some changes to a rule
        ret = self._post('/rules/1', data=dict(throttle=71, mapping='d', priority=73, data_version=1))
        self.assertEquals(ret.status_code, 200, "Status Code: %d, Data: %s" % (ret.status_code, ret.data))

        # Assure the changes made it into the database
        r = db.rules.t.select().where(db.rules.rule_id==1).execute().fetchall()
        self.assertEquals(len(r), 1)
        self.assertEquals(r[0]['mapping'], 'd')
        self.assertEquals(r[0]['throttle'], 71)
        self.assertEquals(r[0]['priority'], 73)
        self.assertEquals(r[0]['data_version'], 2)

    def testBadAuthPost(self):
        ret = self._badAuthPost('/rules/1', data=dict(throttle=100, mapping='c', priority=100, data_version=1))
        self.assertEquals(ret.status_code, 401, "Status Code: %d, Data: %s" % (ret.status_code, ret.data))
        self.assertTrue("not allowed to access" in ret.data, msg=ret.data)

        
