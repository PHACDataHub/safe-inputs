import { HStack, Box, Container } from '@chakra-ui/react';

import { Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import CanadaLogoEn from 'src/assets/sig-blk-en.svg';
import CanadaLogoFr from 'src/assets/sig-blk-fr.svg';

import AuthNavButton from 'src/components/auth/AuthNavButton.tsx';
import LanguageButton from 'src/components/LanguageButton.tsx';
import { Link } from 'src/components/Link.tsx';

const NavButtonStyle = {
  h: '30px',
  margin: '0',
  bg: 'transparent',
  outline: 'varient',
  color: '#333333',
  border: '1px',
  borderColor: '#333333',
  _hover: {
    color: '#FFFFFF',
    bg: '#26374A',
    textDecor: 'underline',
    borderColor: '#FFFFFF',
  },
};

export default function Header() {
  const { i18n } = useLingui();

  return (
    <>
      <Box as="header" bg="#EEEEEE">
        <Container maxW="7xl" px={{ base: 5, md: 10 }} py={4}>
          <HStack justify="space-between">
            <Link
              to="/"
              bg="transparent"
              h="auto"
              _hover={{
                bg: 'transparent',
              }}
              maxW={{ base: '250px', sm: '300px', md: '365px', lg: '400px' }}
              minW={{ base: '180px', sm: '265px', md: '400px', lg: '365px' }}
            >
              {i18n.locale === 'en' ? <CanadaLogoEn /> : <CanadaLogoFr />}
            </Link>
            <HStack spacing="2">
              <AuthNavButton {...NavButtonStyle} />
              <LanguageButton {...NavButtonStyle} />
              <Link to="/">
                <Trans>Home</Trans>
              </Link>
            </HStack>
          </HStack>
        </Container>
      </Box>
    </>
  );
}
