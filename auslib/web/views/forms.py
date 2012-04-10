from simplejson import JSONDecodeError
import simplejson as json
import sys

from flaskext.wtf import Form, TextField, HiddenField, Required, TextInput, NumberRange, IntegerField, SelectField

import logging
log = logging.getLogger(__name__)

class DisableableTextInput(TextInput):
    """A TextInput widget that supports being disabled."""
    def __init__(self, disabled, *args, **kwargs):
        self.disabled = disabled
        TextInput.__init__(self, *args, **kwargs)
    def __call__(self, *args, **kwargs):
        if self.disabled:
            kwargs['disabled'] = 'disabled'
        return TextInput.__call__(self, *args, **kwargs)

class JSONTextField(TextField):
    """TextField that parses incoming data as JSON."""
    def process_formdata(self, valuelist):
        if valuelist and valuelist[0]:
            log.debug("JSONTextField.process_formdata: valuelist[0] is: %s", valuelist[0])
            try:
                self.data = json.loads(valuelist[0])
            except JSONDecodeError, e:
                # WTForms catches ValueError, which JSONDecodeError is a child
                # of. Because of this, we need to wrap this error in something
                # else in order for it to be properly raised.
                log.debug('JSONTextField.process_formdata: Caught JSONDecodeError')
                raise Exception("Couldn't process JSONTextField %s, caught JSONDecodeError" % self.name)
                klass, e, tb = sys.exc_info()
                raise Exception, e, tb
        else:
            log.debug('JSONTextField: No value list, setting self.data to {}')
            self.data = {}

class DbEditableForm(Form):
    data_version = HiddenField('data_version', validators=[Required(), NumberRange()])

class PermissionForm(DbEditableForm):
    options = JSONTextField('Options')

class NewPermissionForm(PermissionForm):
    permission = TextField('Permission', validators=[Required()])

class ExistingPermissionForm(PermissionForm):
    permission = TextField('Permission', validators=[Required()], widget=DisableableTextInput(disabled=True))

class RuleForm(Form):
    throttle = IntegerField('Throttle', validators=[Required()])
    priority = IntegerField('Priority', validators=[Required()])
    mapping = SelectField('Mapping', validators=[Required()])
    product = TextField('Product', validators=[Required()] )
    version = TextField('Version')
    build_id = TextField('BuildID')
    channel = TextField('Channel', validators=[Required()] )
    locale = TextField('Locale')
    distribution = TextField('Distrubution')
    build_target = TextField('Build Target')
    os_version = TextField('OS Version')
    dist_version = TextField('Dist Version')
    comment = TextField('Comment')
    update_type = TextField('Update Type', validators=[Required()] )
    header_arch = TextField('Header Architecture')

class EditRuleForm(RuleForm, DbEditableForm):
    pass
