from simplejson import JSONDecodeError
import simplejson as json
import sys

from flaskext.wtf import Form, TextField, HiddenField, Required, TextInput, NumberRange, IntegerField, SelectField, FileField, file_required

from auslib.blob import ReleaseBlobV1

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

def JSONCatch(func):
    def process_formdata(self, valuelist):
        if valuelist and valuelist[0]:
            try:
                func(self, valuelist)
            except JSONDecodeError, e:
                # WTForms catches ValueError, which JSONDecodeError is a child
                # of. Because of this, we need to wrap this error in something
                # else in order for it to be properly raised.
                log.debug('JSONBlobFileField.process_formdata: Caught JSONDecodeError')
                raise Exception("Couldn't process JSONBlobField %s, caught JSONDecodeError" % self.name)
                klass, e, tb = sys.exc_info()
        else:
            log.debug('JSONBlobField: No value list, setting self.data to {}')
            self.data = {}
    return process_formdata

class JSONBlobFileField(FileField):
    """FileField that parses incoming data as JSON and converts it into a blob"""
    @JSONCatch
    def process_formdata(self, valuelist):
        blob = ReleaseBlobV1()
        blob.loadJSON(valuelist[0])
        self.data = blob

class JSONTextField(TextField):
    """TextField that parses incoming data as JSON."""
    @JSONCatch
    def process_formdata(self, valuelist):
        self.data = json.loads(valuelist[0])
   
class DbEditableForm(Form):
    data_version = HiddenField('data_version', validators=[Required(), NumberRange()])

class PermissionForm(DbEditableForm):
    options = JSONTextField('Options')

class NewPermissionForm(PermissionForm):
    permission = TextField('Permission', validators=[Required()])

class ExistingPermissionForm(PermissionForm):
    permission = TextField('Permission', validators=[Required()], widget=DisableableTextInput(disabled=True))

class RuleForm(DbEditableForm):
    throttle = IntegerField('Throttle', validators=[Required()])
    priority = IntegerField('Priority', validators=[Required()])
    mapping = SelectField('Mapping', validators=[Required()])

class NewReleaseForm(DbEditableForm):
    name = TextField('Name', validators=[Required()])
    version = TextField('Version', validators=[Required()])
    product = TextField('Product', validators=[Required()])
    blob = JSONBlobFileField('Data', validators=[Required(), file_required()])
