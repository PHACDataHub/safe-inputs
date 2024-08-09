import { LinkIcon } from '@chakra-ui/icons';
import {
  Box,
  Container,
  Divider,
  ListItem,
  Text,
  UnorderedList,
} from '@chakra-ui/react';

import { Trans } from '@lingui/macro';

import { Link } from 'src/components/Link.tsx';

export default function TermsAndConditions() {
  function NoticeOfAgreement() {
    return (
      <>
        <Text fontSize={'2xl'} pb={2}>
          <Trans>Notice of Agreement</Trans>
        </Text>
        <UnorderedList>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              By accessing, browsing, or using our website or our services, you
              acknowledge that you have read, understood, and agree to be bound
              by these Terms and Conditions, and to comply with all applicable
              laws and regulations. We recommend that you review all Terms and
              Conditions periodically to understand any updates or changes that
              may affect you. If you do not agree to these Terms and Conditions,
              please refrain from using our website, products and services.
            </Trans>
          </ListItem>
        </UnorderedList>
      </>
    );
  }
  function Privacy() {
    return (
      <>
        <Text fontSize={'2xl'} pb={2}>
          <Trans>Privacy</Trans>
        </Text>
        <UnorderedList>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              For details related to terms pertaining to privacy, please refer
              to{' '}
              <Link
                isExternal
                textDecor={'underline'}
                href="https://publiservice.tbs-sct.gc.ca/tbs-sct/cmn/notices-avis-eng.asp"
              >
                our Terms and Conditions on the TBS website
                <LinkIcon m="2px" />
              </Link>
              .
            </Trans>
            <Trans>
              Personal information will not be disclosed by Treasury Board
              Secretariat of Canada (TBS) except in accordance with the{' '}
              <Link
                isExternal
                textDecor={'underline'}
                href="https://publiservice.tbs-sct.gc.ca/tbs-sct/cmn/notices-avis-eng.asp"
              >
                Privacy Act
                <LinkIcon m="2px" />
              </Link>
              .
            </Trans>
          </ListItem>
        </UnorderedList>
      </>
    );
  }
  function AccessToInformation() {
    return (
      <>
        <Trans>
          <Text fontSize={'2xl'} pb={2}>
            Access to Information
          </Text>
        </Trans>

        <UnorderedList>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                Information shared with TBS, or acquired via systems hosted by
                TBS, may be subject to public disclosure under the{' '}
                <Link
                  isExternal
                  textDecor={'underline'}
                  href="https://www.canada.ca/en/treasury-board-secretariat/services/access-information-privacy/access-information-act.html"
                >
                  Access to Information Act.
                  <LinkIcon m="2px" />
                </Link>
              </Text>
            </Trans>
          </ListItem>
        </UnorderedList>
      </>
    );
  }
  function DataSecurityAndUse() {
    return (
      <>
        <Trans>
          <Text fontSize={'2xl'} pb={2}>
            Data Security and Use
          </Text>
        </Trans>
        <UnorderedList>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                You agree to protect any information disclosed to you by TBS in
                accordance with the data handling measures outlined in these
                Terms & Conditions. Similarly, TBS agrees to protect any
                information you disclose to us. Any such information must only
                be used for the purposes for which it was intended.
              </Text>
            </Trans>
          </ListItem>
        </UnorderedList>
      </>
    );
  }
  function IntellectualPropertyCopyrightAndTrademark() {
    return (
      <>
        <Trans>
          <Text fontSize={'2xl'} pb={2}>
            Intellectual Property, Copyright and Trademarks
          </Text>
        </Trans>
        <UnorderedList>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                Any products or related services provided to you by TBS are and
                will remain the intellectual property of the Government of
                Canada.
              </Text>
            </Trans>
          </ListItem>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                The graphics displayed on the Safe Inputs PoC website may not be
                used, in whole or in part, in connection with any business,
                products or service, or otherwise used, in a manner that is
                likely to lead to the belief that such business product, service
                or other use, has received the Government of Canada{`'`}s
                approval and may not be copied, reproduced, imitated, or used,
                in whole or in part, without the prior written permission of
                tbs.
              </Text>
            </Trans>
          </ListItem>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                The material available on this web site is subject to the{' '}
                <Link
                  isExternal
                  textDecor={'underline'}
                  href="https://cb-cda.gc.ca/en/copyright-information/acts-and-regulations"
                >
                  Copyright Act{' '}
                </Link>
                and{' '}
                <Link
                  isExternal
                  textDecor={'underline'}
                  href="https://laws-lois.justice.gc.ca/eng/acts/t-13/FullText.html"
                >
                  Trademarks Act
                </Link>
                and by applicable laws, policies, regulations and international
                agreements.
              </Text>
            </Trans>
          </ListItem>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                Use of intellectual property in breach of this agreement may
                result in the termination of access to the Safe Inputs PoC
                website, product or services.
              </Text>
            </Trans>
          </ListItem>
        </UnorderedList>
      </>
    );
  }
  function DataHandling() {
    return (
      <>
        <Trans>
          <Text fontSize={'2xl'} pb={2}>
            Data Handling
          </Text>
        </Trans>
        <UnorderedList>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                TBS agrees to protect any information you disclose to us in a
                manner commensurate with the level of protection you use to
                secure such information, but in any event, with no less than a
                reasonable level of care.
              </Text>
            </Trans>
          </ListItem>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                You acknowledge that any data or information disclosed to TBS
                may be used to protect the Government of Canada as well as
                electronic information and information infrastructures
                designated as being of importance to the Government of Canada in
                accordance with cyber security and information assurance aspect
                of TBS{`'`}s mandate under the Policy on Government Security and
                the Policy on Service and Digital.
              </Text>
            </Trans>
          </ListItem>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                Any data or information disclosed to TBS will be used in a
                manner consistent with our{' '}
                <Link
                  textDecor={'underline'}
                  isExternal
                  href="https://publiservice.tbs-sct.gc.ca/tbs-sct/cmn/notices-avis-eng.asp"
                >
                  Privacy Notice Statement
                  <LinkIcon />
                </Link>
                .
              </Text>
            </Trans>
          </ListItem>
        </UnorderedList>
      </>
    );
  }

  function LimitationOfLiability() {
    return (
      <>
        <Trans>
          <Text fontSize={'2xl'} pb={2}>
            Limitation of Liability
          </Text>
        </Trans>
        <UnorderedList>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                The advice, guidance or services provided to you by TBS will be
                provided on an “as-is” basis, without warrantee or
                representation of any kind, and TBS will not be liable for any
                loss, liability, damage or cost, including loss of data or
                interruptions of business arising from the provision of such
                advice, guidance or services by Safe Inputs PoC. Consequently,
                TBS recommends, that the users exercise their own skill and care
                with respect to their use of the advice, guidance and services
                that Safe Inputs PoC provides.
              </Text>
            </Trans>
          </ListItem>
        </UnorderedList>
      </>
    );
  }
  function TermsOfUse() {
    return (
      <>
        <Trans>
          <Text fontSize={'2xl'} pb={2}>
            Terms of Use
          </Text>
        </Trans>
        <UnorderedList>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                You agree to use our website, products and services only for
                lawful purposes and in a manner that does not infringe the
                rights of, or restrict or inhibit the use and enjoyment of, the
                website, products or services by any third party. Additionally,
                you must not misuse, compromise or interfere with our services,
                or introduce material to our services that is malicious or
                technologically harmful. You must not attempt to gain
                unauthorized access to, tamper with, reverse engineer, or modify
                our website, products or services, the server(s) on which they
                are stored, or any server, computer or database connected to our
                website, products or services. We may suspend or stop providing
                our products or services to you if you do not comply with our
                terms or policies or if we are investigating suspected
                misconduct. Any suspected illegal use of our website, products
                or services may be reported to the relevant law enforcement
                authorities and where necessary we will co-operate with those
                authorities by disclosing your identity to them.
              </Text>
            </Trans>
          </ListItem>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                Information on this site, other than protected intellectual
                property, such as copyright and trademarks, and Government of
                Canada symbols and other graphics, has been posted with the
                intent that it be readily available for personal and public
                non-commercial use and may be reproduced, in part or in whole
                and by any means, without charge or further permission from TBS.
                We ask only that:
              </Text>
            </Trans>
            <UnorderedList>
              <ListItem listStyleType="circle" mx={6}>
                <Trans>
                  <Text>
                    Users exercise due diligence in ensuring the accuracy of the
                    materials reproduced;
                  </Text>
                </Trans>
              </ListItem>
              <ListItem listStyleType="circle" mx={6}>
                <Trans>
                  <Text>TBS be identified as the source; and</Text>
                </Trans>
              </ListItem>
              <ListItem listStyleType="circle" mx={6}>
                <Trans>
                  <Text>
                    The reproduction is not represented as an official version
                    of the materials reproduced, nor as having been made, in
                    affiliation with or under the direction of TBS.
                  </Text>
                </Trans>
              </ListItem>
            </UnorderedList>
          </ListItem>
        </UnorderedList>
      </>
    );
  }
  function NoticeOfChange() {
    return (
      <>
        <Trans>
          <Text fontSize={'2xl'} pb={2}>
            Notification of Changes
          </Text>
        </Trans>
        <UnorderedList>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                We reserve the right to make changes to our website layout and
                content, policies, products, services, and these Terms and
                Conditions at any time without notice. Please check these Terms
                and Conditions regularly, as continued use of our services after
                a change has been made will be considered your acceptance of the
                change.
              </Text>
            </Trans>
          </ListItem>
        </UnorderedList>
      </>
    );
  }
  function Termination() {
    return (
      <>
        <Trans>
          <Text fontSize={'2xl'} pb={2}>
            Termination
          </Text>
        </Trans>
        <UnorderedList>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                We reserve the right to modify or terminate our services for any
                reason, without notice, at any time.
              </Text>
            </Trans>
          </ListItem>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                If at any time you or your representatives wish to adjust or
                cancel these services, please contact us at: <br />
                <Link
                  isExternal
                  textDecor={'underline'}
                  href="https://https-everywhere.canada.ca/en/help/"
                >
                  https://https-everywhere.canada.ca/en/help/
                  <LinkIcon m="2px" />
                </Link>
              </Text>
            </Trans>
          </ListItem>
        </UnorderedList>
      </>
    );
  }
  function Jurisdiction() {
    return (
      <>
        <Trans>
          <Text fontSize={'2xl'} pb={2}>
            Jurisdiction
          </Text>
        </Trans>
        <UnorderedList>
          <ListItem listStyleType="disc" px={2}>
            <Trans>
              <Text>
                These terms and conditions shall be governed by and interpreted
                under the laws of Canada, without regard for any choice of law
                rules. The courts of Canada shall have exclusive jurisdiction
                over all matters arising in relation to these terms and
                conditions.
              </Text>
            </Trans>
          </ListItem>
        </UnorderedList>
      </>
    );
  }

  return (
    <>
      <Box className="App-header" mb={2}>
        <h2>
          <Trans>Terms and Conditions</Trans>
        </h2>
      </Box>

      <Container maxW="7xl" px={10} my={6} textAlign="justify">
        <NoticeOfAgreement />

        <Divider m={2} />
        <Privacy />

        <Divider m={2} />
        <AccessToInformation />

        <Divider m={2} />
        <DataSecurityAndUse />

        <Divider m={2} />
        <IntellectualPropertyCopyrightAndTrademark />

        <Divider m={2} />
        <DataHandling />

        <Divider m={2} />
        <LimitationOfLiability />

        <Divider m={2} />
        <TermsOfUse />

        <Divider m={2} />
        <NoticeOfChange />

        <Divider m={2} />
        <Termination />

        <Divider m={2} />
        <Jurisdiction />
      </Container>
      <br />
    </>
  );
}
