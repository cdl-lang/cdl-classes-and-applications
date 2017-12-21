#!/bin/bash

cd `dirname $0`
ROOTDIR=../..

XTRA_ARGS=""
MKCMD=make

if [ "x${1}" == "x" ]; then
  LOGDIR="/tmp/full_test_log"
  echo "${0}: log dir set to ${LOGDIR}"
else
  LOGDIR=${1}
fi

source ${ROOTDIR}/cdl/test/util/automatedTestLib.sh

# override automatedTestLib's defaults
ABORT_ON_ERROR=no


SLEEPDURATION=10

. ./sanityTestList.sh

. ./extraTestList.sh

echo "total: npass=${AT_NPASS} nfail=${AT_NFAIL} " \
    "execution=${AT_EXECUTION_TIME} make=${AT_MAKE_TIME}" > \
    ${REVLOGDIR}/total.log

exit 0
