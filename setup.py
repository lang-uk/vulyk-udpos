#!/usr/bin/env python
# -*- coding: utf-8 -*-
try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

with open('README.rst') as readme_file:
    readme = readme_file.read()

with open('HISTORY.rst') as history_file:
    history = history_file.read().replace('.. :changelog:', '')

with open('requirements.txt', 'r') as fd:
    requirements = list(filter(lambda r: not r.strip().startswith('#'), fd.readlines()))

test_requirements = requirements


setup(
    name="vulyk_udpos",
    version="0.1.0",
    description="Vulyk UD POS tagging plugin",
    long_description=readme + "\n\n" + history,
    author="Dmytro Chaplynskyi",
    author_email="chaplinsky.dmitry@gmail.com",
    url="https://github.com/lang-uk/vulyk-udpos",
    packages=["vulyk_udpos", "vulyk_udpos.models", "vulyk_udpos.static"],
    package_dir={"vulyk_udpos": "vulyk_udpos"},
    include_package_data=True,
    install_requires=requirements,
    license="BSD",
    zip_safe=False,
    keywords="vulyk_udpos",
    classifiers=[
        "Development Status :: 2 - Pre-Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: BSD License",
        "Natural Language :: English",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: 3.13",
    ],
    test_suite="tests",
    tests_require=test_requirements,
)
