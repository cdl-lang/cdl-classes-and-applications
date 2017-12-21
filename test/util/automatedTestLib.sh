#!/bin/bash

# The automated tests require a few node modules. These are installed at the
# top level to avoid duplication.

pushd "${ROOTDIR}"
npm install cdl
popd

SLEEPDURATION=5

ABORT_ON_ERROR=no

OS=$(uname -s)

if [ "${OS}" == "Darwin" ] || [ "${OS}" == "Linux" ]; then
    RUN="time bash -c"
else
   RUN="cmd.exe /c"
fi

SEDRE="sed -r -e"
# Get information on the revision

function getSvnRev
{
    local dir=${1}

    local SVNINFO=$(svn info ${dir} | grep Revision 2>/dev/null)
    local REV=${SVNINFO/Revision: /}

    if [ "x${REV}" == "x" ]; then
        REV=unknown
    fi

    echo ${REV}
}

CDLREV=$(getSvnRev ${ROOTDIR}/cdl)
SCRIPTSREV=$(getSvnRev ${ROOTDIR}/scripts)

if [ ${CDLREV} == ${SCRIPTSREV} ]; then
    REV=${CDLREV}
else
    REV=s${SCRIPTSREV}.t${CDLREV}
fi

REVLOGDIR=${LOGDIR}/${REV}

AT_EXECUTION_TIME=0
AT_MAKE_TIME=0

AT_NPASS=0
AT_NFAIL=0

INTERRUPTED=false
control_c()
# run if user hits control-c
{
  echo -en "\n*** interrupted  - waiting for sub-task to exit ***\n"
  INTERRUPTED=true
}


# scripts for which 'make' was already run

function run {

    local APPNAME=$1
    local PARAMSTR="$2 $XTRA_ARGS"

    local TEST_STATUS

    local LOGPARAMSTR=$(echo ${PARAMSTR} | sed -e 's/ /_/g')
    local TEST_NAME=${APPNAME}__${LOGPARAMSTR}
    local LOGFILE=${REVLOGDIR}/${TEST_NAME}.log
    local NODEJS_FILE=${APPNAME}.node.js

    SUMMARYFILE=${REVLOGDIR}/summary.log

    echo " "

    if ! mk ${NODEJS_FILE}; then
        if [ "${ABORT_ON_ERROR}" == "yes" ]; then
            echo " "
            echo "${0}: Aborting test execution"
            exit 1
        fi

        TEST_STATUS=Fail
        AT_NFAIL=$((${AT_NFAIL} + 1))

    else

        sleep "${SLEEPDURATION}"

        echo "-    execute ${APPNAME} ${PARAMSTR}..."

        local STARTTM=$(date +%s)

        # trap keyboard interrupt (control-c)
        trap control_c SIGINT
        if [ ${REMOTE-0} = 1 ]
        then
            PARAMSTR="${PARAMSTR} remote=true protocol=ws"
            echo "clear ${APPNAME}"
            if ! ${ROOTDIR}/scripts/remoting/dbio/dbio.sh clear -P ws "${APPNAME}" # assumes there is a persistence server running.
            then
                echo dbio failed
                exit 1
            fi
        fi
        if ! ${RUN} "node ${CDLDIR}/${NODEJS_FILE} test=true ${PARAMSTR}" >& "${LOGFILE}"
        then
            echo ERROR "${APPNAME}" >> "${LOGFILE}"
            echo ERROR
            TEST_STATUS=Fail
            AT_NFAIL=$((${AT_NFAIL} + 1))
            if [ "${ABORT_ON_ERROR}" == "yes" ]; then
                echo " "
                echo "${0}: *** ERROR in ${APPNAME} ${PARAMSTR} ***"
                echo "${0}: Aborting test execution"
                exit 1
            fi
        else
            echo "done"
            TEST_STATUS=Pass
            AT_NPASS=$((${AT_NPASS} + 1))
        fi
        trap - SIGINT

        local ENDTM=$(date +%s)

        local ELAPSED=$((${ENDTM} - ${STARTTM}))
        AT_EXECUTION_TIME=$((${AT_EXECUTION_TIME} + ${ELAPSED}))
    fi

    if [ "${INTERRUPTED}" == true ]; then
        echo "$0: Exiting (interrupted)"
        exit 1
    fi

    local summary_msg="${TEST_NAME} ${TEST_STATUS}"
    if [ "${TEST_STATUS}" == "Pass" ]; then
        summary_msg="${summary_msg} ${ELAPSED}"
    fi
    echo "${summary_msg}" >> ${SUMMARYFILE}
}

function mk {
    MKNAME=$1
    MKLOG=${REVLOGDIR}/${MKNAME}.mk

    if [[ ! -f ${MKLOG} ]]; then
        echo -n "-    Make ${MKNAME}..."

        local STARTTM=$(date +%s)

        
        # trap keyboard interrupt (control-c)
        trap control_c SIGINT
        if ! (cd ${CDLDIR}; ${MKCMD} ${MKNAME}) >& ${MKLOG}; then
            trap - SIGINT

            echo ERROR
            echo " "
            echo "${0}: *** ERROR in 'make ${MKNAME}' ***"

            if [ "${INTERRUPTED}" == true ]; then
                echo "$0: Exiting (interrupted)"
                exit 1
            fi

            return 1
        fi

        trap - SIGINT

        local ENDTM=$(date +%s)

        echo done

        local ELAPSED=$((${ENDTM} - ${STARTTM}))

        AT_MAKE_TIME=$((${AT_MAKE_TIME} + ${ELAPSED}))
    fi
}


if [ "${ISREADONLY-false}" != true ]; then
    if [ -d ${REVLOGDIR} ]; then
        echo "$0: log directory ${REVLOGDIR} already exists"
        exit 1
    fi

    mkdir -p ${REVLOGDIR}
fi
