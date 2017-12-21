#!/bin/bash

TEMP=`getopt brm: "$@"`
eval set -- "$TEMP"

XTRA_ARGS=""
REMOTE=0
MKCMD=make

while true ; do
    case "$1" in
        -m) XTRA_ARGS="$XTRA_ARGS maxTestDuration=$2" ; shift 2;;
        -r) REMOTE=1 ; shift ;;
        -b) MKCMD="./build.sh" ; shift ;;
        --) shift ; break ;;
        *) echo "Internal error!: '$1'"  ; exit 1 ;;
    esac
done

echo "$0: starting"
date
echo " "

cd `dirname $0`
ROOTDIR=../..

LOGDIR=/tmp/sanity.$(date +%Y_%m_%d_%H_%M_%S)/log

source ${ROOTDIR}/cdl/test/util/automatedTestLib.sh

echo ${0}: log directory is ${REVLOGDIR}

SLEEPDURATION=0

. ./sanityTestList.sh

echo " "
echo "${0}: execution took ${AT_EXECUTION_TIME} seconds (make=${AT_MAKE_TIME}s)"
date

if [ "${AT_NFAIL}" != 0 ]
then
    echo
    echo "*** " ${AT_NFAIL} " TEST(S) FAILED ***"
fi

exit 0
