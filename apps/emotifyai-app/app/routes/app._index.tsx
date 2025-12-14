import { Page, Layout, Text, Card, BlockStack, Button, InlineStack, List, Box } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ExternalIcon } from "@shopify/polaris-icons";

export default function Index() {
  return (
    <Page>
      <TitleBar title="Verba - AI Text Enhancer" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Welcome to Verba! 🎉
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Verba is an AI-powered text enhancement platform that seamlessly integrates into your workflow.
                    To get started, please install our browser extension.
                  </Text>
                </BlockStack>

                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Step 1: Install the Extension
                  </Text>
                  <InlineStack gap="300">
                    <Button
                      variant="primary"
                      icon={ExternalIcon}
                      url="https://chrome.google.com/webstore/detail/your-extension-id"
                      target="_blank"
                    >
                      Install for Chrome
                    </Button>
                    <Button
                      icon={ExternalIcon}
                      url="https://addons.mozilla.org/en-US/firefox/addon/your-extension-id"
                      target="_blank"
                    >
                      Install for Firefox
                    </Button>
                  </InlineStack>
                </BlockStack>

                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Step 2: Pin the Extension
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Click the puzzle piece icon in your browser toolbar and pin Verba for easy access.
                  </Text>
                </BlockStack>

                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Step 3: Start Enhancing
                  </Text>
                  <List type="bullet">
                    <List.Item>Select any text on a webpage</List.Item>
                    <List.Item>Right-click and choose "Enhance with Verba"</List.Item>
                    <List.Item>Or use the shortcut: Ctrl+Shift+E</List.Item>
                  </List>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Need Help?
                  </Text>
                  <List>
                    <List.Item>
                      <Button variant="plain" url="https://emotifyai.com/docs" target="_blank">
                        Documentation
                      </Button>
                    </List.Item>
                    <List.Item>
                      <Button variant="plain" url="mailto:support@emotifyai.com">
                        Contact Support
                      </Button>
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
