import pymysql
pymysql.version_info = (2, 2, 1, 'final', 0)
pymysql.install_as_MySQLdb()

from django.db.backends.base.base import BaseDatabaseWrapper
BaseDatabaseWrapper.check_database_version_supported = lambda self: None
