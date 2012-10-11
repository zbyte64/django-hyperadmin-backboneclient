============
Introduction
============

django-hyperadmin-backboneclient is a hyper admin client powered by backbone.js.

--------
Features
--------
Defines it's own media type: application/vnd.Collection.hyperadmin.backboneclient+JSON


------------
Requirements
------------

* Python 2.6 or later
* Django 1.3 or later
* django-hyperadmin


============
Installation
============

Put 'backboneclient' into your ``INSTALLED_APPS`` section of your settings file.

Add to your root url patterns::

    url(r'^backbone-admin/', include('backboneclient.urls')),

