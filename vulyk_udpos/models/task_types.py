# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from vulyk.models.task_types import AbstractTaskType

from vulyk_udpos.models.tasks import UDPOSTaggingAnswer, UDPOSTaggingTask


class UDPOSTaggingTaskType(AbstractTaskType):
    """
    UDPos Tagging Task to work with Vulyk.
    """
    answer_model = UDPOSTaggingAnswer
    task_model = UDPOSTaggingTask

    name = 'Розмітка частин мови (UDPOS)'
    description = 'Тегування частин мови за універсальною залежнісною граматикою (Universal Dependencies).'

    template = 'base.html'
    helptext_template = 'help.html'
    type_name = 'udpos_tagging_task'

    redundancy = 3

    JS_ASSETS = ['static/scripts/keymaster.js',
                 'static/scripts/handlebars.js',
                 'static/scripts/bootstrap-select.js',
                 'static/scripts/typeahead.js',
                 'static/scripts/bootstrap-tagsinput.js',
                 'static/scripts/base.js']

    CSS_ASSETS = ['static/styles/bootstrap-select.css',
                  'static/styles/bootstrap-tagsinput.css',
                  'static/styles/base.css',
                  'static/styles/autocomplete.css']
