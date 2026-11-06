import logoFlowtech from "@/assets/flow-icon-light.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/store/auth-store";
import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function ConfigurarJiraPage() {
  const navigate = useNavigate();
  const configurarJira = useAuth((state) => state.configurarJira);
  const buscarEmpresa = useAuth((state) => state.buscarEmpresa);
  const isPending = useAuth((state) => state.isPending);

  const [jiraData, setJiraData] = useState({
    jira_email: "",
    jira_base_url: "",
    jira_project_key: "",
    jira_api_key: "",
  });

  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [carregando, setCarregando] = useState(true);

useEffect(() => {
    async function carregarDadosJira() {
      const result = await buscarEmpresa();
      console.log("Resultado retornado para a página:", result);

      if (result.success && result.data) {
        const empresa = Array.isArray(result.data) ? result.data[0] : result.data;

        if (empresa) {
          setJiraData({
            jira_email: empresa.jira_email ?? "",
            jira_base_url: empresa.jira_base_url ?? "",
            jira_project_key: empresa.jira_project_key ?? "",
            jira_api_key: empresa.jira_api_key ?? "",
          });
        }
      }
      setCarregando(false);
    }
    carregarDadosJira();
  }, [buscarEmpresa]);

  const handleJiraEmailChange = (e) =>
    setJiraData((prev) => ({ ...prev, jira_email: e.target.value }));

  const handleJiraBaseUrlChange = (e) =>
    setJiraData((prev) => ({ ...prev, jira_base_url: e.target.value }));

  const handleJiraProjectKeyChange = (e) =>
    setJiraData((prev) => ({ ...prev, jira_project_key: e.target.value }));

  const handleJiraApiKeyChange = (e) =>
    setJiraData((prev) => ({ ...prev, jira_api_key: e.target.value }));

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = jiraData.jira_email === "" || emailRegex.test(jiraData.jira_email);

  const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/;
  const isBaseUrlValid = jiraData.jira_base_url === "" || urlRegex.test(jiraData.jira_base_url);

  const isFormValid = isEmailValid && isBaseUrlValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const result = await configurarJira(jiraData);

    if (!result.success) {
      toast.add({
        description: result.error,
        type: "error",
      });
      return;
    }

    toast.add({
      description: "Configurações do Jira atualizadas com sucesso!",
      type: "success",
    });

    navigate({ pathname: "/configuracoes", replace: true });
  };

  const toggleApiKeyVisible = () => setApiKeyVisible((prev) => !prev);

  if (carregando) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-w-lg flex flex-col items-center  space-y-12">
      <div className="flex items-center space-x-2">
        <img src={logoFlowtech} alt="FlowTech Logo" className="w-12" />
        <h2 className="text-4xl font-heading font-bold -ml-4 pt-2">lowTech</h2>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Configurar Integração Jira
            </CardTitle>
            <CardDescription>
              Atualize os dados do Jira da sua empresa quando necessário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="jira-email">E-mail do Jira</FieldLabel>
                <Input
                  id="jira-email"
                  type="text"
                  value={jiraData.jira_email}
                  onChange={handleJiraEmailChange}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="jira-base-url">URL Base</FieldLabel>
                <Input
                  id="jira-base-url"
                  type="text"
                  value={jiraData.jira_base_url}
                  onChange={handleJiraBaseUrlChange}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="jira-project-key">Chave do Projeto (Project Key)</FieldLabel>
                <Input
                  id="jira-project-key"
                  type="text"
                  value={jiraData.jira_project_key}
                  onChange={handleJiraProjectKeyChange}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="jira-api-key">API Key (Token)</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="jira-api-key"
                    type={apiKeyVisible ? "text" : "password"}
                    value={jiraData.jira_api_key}
                    onChange={handleJiraApiKeyChange}
                  />
                  <InputGroupAddon align="block-right">
                    <InputGroupButton size="icon" type="button" onClick={toggleApiKeyVisible}>
                      {apiKeyVisible ? <EyeClosedIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex flex-col items-end space-y-2 bg-background-light">
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !isFormValid}
            >
              {isPending ? (
                <span className="flex items-center space-x-2">
                  <Spinner /> Salvando
                </span>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}